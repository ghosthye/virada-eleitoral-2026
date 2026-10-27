"""Exploratory constrained ecological regression, calibrated to official margins.

This estimates aggregate associations under an explicit constant-transition
assumption within each macroregion. It does not observe individual transitions.
Run with NumPy and SciPy installed; all input categories and source hashes are
published alongside the output. No rates from external analysts are used.
"""
import argparse, json, time, hashlib, platform
from pathlib import Path
import numpy as np
from scipy.optimize import minimize
import scipy

SEED = 20261027

def fit_rates(X, Y, weights, ridge=1e-6, prior=None, initial=None):
    """Rows of P are probability simplexes. Penalization is explicit, not data."""
    R, C = X.shape[1], Y.shape[1]
    weights = weights / weights.sum()
    A = X.T @ (weights[:, None] * X)
    B = X.T @ (weights[:, None] * Y)
    if prior is None:
        q = (weights[:, None] * Y).sum(axis=0)
        prior = np.tile(q, (R, 1))
    def loss(v):
        P = v.reshape(R, C)
        return float(np.sum(P * (A @ P)) - 2 * np.sum(P * B) + ridge * np.sum((P-prior)**2))
    def gradient(v):
        P = v.reshape(R, C)
        return (2 * (A @ P-B) + 2*ridge*(P-prior)).ravel()
    constraint = np.kron(np.eye(R), np.ones((1, C)))
    result = minimize(loss, (prior if initial is None else initial).ravel(), jac=gradient, method='SLSQP', bounds=[(0,1)]*(R*C),
                      constraints={'type':'eq','fun':lambda v:constraint@v-1,'jac':lambda v:constraint},
                      options={'ftol':1e-12,'maxiter':800})
    if not result.success:
        raise RuntimeError('Optimizer did not converge: '+result.message)
    P=np.maximum(result.x.reshape(R,C),0)
    return P/P.sum(axis=1,keepdims=True), int(result.nit)

def calibrate(P, Xcounts, Ycounts, tolerance=.001, max_iter=120, floor=1e-6):
    """Entropic margin adjustment; Newton solves the IPF column multipliers.

    Algebraically the same positive-seed KL projection as RAS/IPF, avoiding
    thousands of alternating-scaling iterations near boundaries.
    """
    seed=np.maximum(P,floor)
    N=Xcounts.sum(axis=1)
    result=np.zeros((len(Xcounts),Xcounts.shape[1],Ycounts.shape[1]))
    patterns={tuple(row>0) for row in Ycounts}
    worst_steps=0
    for mask in patterns:
        columns=np.flatnonzero(mask)
        ix=np.flatnonzero(np.all((Ycounts>0)==mask,axis=1))
        x=Xcounts[ix]/N[ix,None]; y=Ycounts[ix][:,columns]/N[ix,None]
        logp=np.log(seed[:,columns]); dual=np.zeros((len(ix),len(columns)))
        if len(columns)==1:
            result[ix,:,columns[0]]=Xcounts[ix]
            continue
        def quantities(d):
            z=logp[None,:,:]+d[:,None,:]
            maximum=z.max(axis=2,keepdims=True)
            exponent=np.exp(z-maximum)
            norm=exponent.sum(axis=2,keepdims=True)
            q=exponent/norm
            obj=np.sum(x*(maximum[:,:,0]+np.log(norm[:,:,0])),axis=1)-np.sum(y*d,axis=1)
            return q,obj
        for step in range(max_iter):
            q,obj=quantities(dual)
            column=np.einsum('ur,urc->uc',x,q)
            error=np.max(np.abs((column-y)*N[ix,None]),axis=1)
            active=error>=tolerance
            if not np.any(active):break
            h=-np.einsum('ur,urc,urd->ucd',x,q,q)
            ar=np.arange(len(columns));h[:,ar,ar]+=column
            h=h[:,:-1,:-1]
            gradient=(column-y)[:,:-1]
            delta=np.linalg.solve(h+np.eye(len(columns)-1)[None,:,:]*1e-14,gradient[:,:,None])[:,:,0]
            delta=np.clip(delta,-5,5);delta[~active]=0
            scale=np.ones(len(ix))
            for _ in range(18):
                candidate=dual.copy();candidate[:,:-1]-=scale[:,None]*delta
                _,new_obj=quantities(candidate)
                bad=new_obj>obj+1e-13
                if not np.any(bad):break
                scale[bad]*=.5
            dual=candidate
        else:
            raise RuntimeError('Entropic adjustment did not converge: '+str(float(error.max())))
        q,_=quantities(dual)
        local=Xcounts[ix,:,None]*q
        for j,col in enumerate(columns):result[ix,:,col]=local[:,:,j]
        worst_steps=max(worst_steps,step+1)
    error=max(np.max(np.abs(result.sum(axis=1)-Ycounts)),np.max(np.abs(result.sum(axis=2)-Xcounts)))
    if error>tolerance*1.01:raise RuntimeError('Margin error: '+str(error))
    return result,worst_steps,float(error)

def load_input(path):
    data=json.loads(Path(path).read_text(encoding='utf-8'))
    X=np.array([u['X'] for u in data['units']],dtype=float)
    Y=np.array([u['Y'] for u in data['units']],dtype=float)
    N=np.array([u['N'] for u in data['units']],dtype=float)
    if not (np.all(X>=0) and np.all(Y>=0) and np.all(X.sum(axis=1)==N) and np.all(Y.sum(axis=1)==N)):
        raise ValueError('Input margins do not reconcile')
    return data,X,Y,N

def prototype(path):
    data,X,Y,N=load_input(path)
    national=np.zeros((X.shape[1],Y.shape[1]))
    for region in sorted(set(u['region'] for u in data['units'])):
        ix=np.array([i for i,u in enumerate(data['units']) if u['region']==region])
        start=time.time();P,it=fit_rates(X[ix]/N[ix,None],Y[ix]/N[ix,None],N[ix]);F,steps,error=calibrate(P,X[ix],Y[ix])
        national+=F.sum(axis=0)
        residual=(X[ix]/N[ix,None]@P-Y[ix]/N[ix,None])*100
        print(json.dumps({'region':region,'units':len(ix),'seconds':round(time.time()-start,3),'optimizerSteps':it,'ipfSteps':steps,'calibrationError':error,'weightedMAEpp':np.average(np.abs(residual),weights=N[ix],axis=0).tolist(),'rates':P.tolist()},ensure_ascii=False),flush=True)
    print(json.dumps({'national':national.tolist(),'rowPercent':(national/national.sum(axis=1,keepdims=True)*100).tolist()},ensure_ascii=False),flush=True)

def balanced_round(F, X, Y):
    """Deterministic residual rounding; exact row and column counts, not precision of inference."""
    rounded=np.floor(np.maximum(F,0)).astype(np.int64)
    for i in range(len(rounded)):
        a=rounded[i];x=X[i].astype(np.int64);y=Y[i].astype(np.int64)
        for row in np.flatnonzero(a.sum(axis=1)>x):
            extra=int(a[row].sum()-x[row])
            for col in np.argsort(-a[row]):
                take=min(extra,int(a[row,col]));a[row,col]-=take;extra-=take
                if extra==0:break
        for col in np.flatnonzero(a.sum(axis=0)>y):
            extra=int(a[:,col].sum()-y[col])
            for row in np.argsort(-a[:,col]):
                take=min(extra,int(a[row,col]));a[row,col]-=take;extra-=take
                if extra==0:break
        dr=x-a.sum(axis=1);dc=y-a.sum(axis=0)
        for cell in np.argsort(-(F[i]-np.floor(F[i])).ravel(),kind='stable'):
            row,col=divmod(int(cell),a.shape[1]);v=min(dr[row],dc[col])
            a[row,col]+=v;dr[row]-=v;dc[col]-=v
        if np.any(dr) or np.any(dc) or np.any(a<0):raise RuntimeError('Integer reconciliation failed')
    return rounded

def sensitivity_range(samples,alternatives,point):
    low=np.minimum(np.quantile(samples,.05,axis=0),np.min(alternatives,axis=0))
    high=np.maximum(np.quantile(samples,.95,axis=0),np.max(alternatives,axis=0))
    return np.floor(np.minimum(low,point)).astype(np.int64),np.ceil(np.maximum(high,point)).astype(np.int64)

def run_model(path,output,replicates):
    data,X,Y,N=load_input(path);out=Path(output);out.mkdir(parents=True,exist_ok=True)
    R,C=X.shape[1],Y.shape[1];rng=np.random.default_rng(SEED)
    points=np.zeros((len(X),R,C),dtype=np.int64);lower=points.copy();upper=points.copy()
    boot_national=np.zeros((replicates,R,C));alt_national=np.zeros((6,R,C))
    national=np.zeros((R,C),dtype=np.int64);states={};diagnostics=[]
    region_names=sorted(set(u['region'] for u in data['units']))
    for region_number,region in enumerate(region_names):
        started=time.time();ix=np.array([i for i,u in enumerate(data['units']) if u['region']==region])
        xx,yy,nn=X[ix],Y[ix],N[ix];xp,yp=xx/nn[:,None],yy/nn[:,None]
        folds=np.zeros(len(ix),dtype=int)
        uf_indices={uf:np.array([j for j,i in enumerate(ix) if data['units'][i]['uf']==uf]) for uf in sorted(set(data['units'][i]['uf'] for i in ix))}
        for positions in uf_indices.values():folds[positions]=rng.permutation(len(positions))%3
        cv=[]
        for ridge in [1e-7,1e-6,1e-5,1e-4]:
            numerator=0.;denominator=0.
            for fold in range(3):
                train=folds!=fold;test=~train
                P,_=fit_rates(xp[train],yp[train],nn[train],ridge)
                error=xp[test]@P-yp[test]
                numerator+=float(np.sum(nn[test,None]*error**2));denominator+=float(nn[test].sum())
            cv.append({'ridge':ridge,'weightedMSE':numerator/denominator})
        minimum=min(x['weightedMSE'] for x in cv)
        ridge=max(x['ridge'] for x in cv if x['weightedMSE']<=minimum*1.01+1e-15)
        P,iterations=fit_rates(xp,yp,nn,ridge)
        F,steps,calibration_error=calibrate(P,xx,yy);point=balanced_round(F,xx,yy)
        points[ix]=point;national+=point.sum(axis=0)
        prediction=xp@P
        mae=np.average(np.abs(prediction-yp),weights=nn,axis=0)*100
        boot=[]
        for replica in range(replicates):
            multiplicity=np.zeros(len(ix))
            for positions in uf_indices.values():
                draws=rng.choice(positions,size=len(positions),replace=True)
                multiplicity+=np.bincount(draws,minlength=len(ix))
            PB,_=fit_rates(xp,yp,nn*multiplicity,ridge,initial=P)
            FB,_,_=calibrate(PB,xx,yy,tolerance=.01)
            boot.append(FB.astype(np.float32));boot_national[replica]+=FB.sum(axis=0)
            if (replica+1)%25==0:print(json.dumps({'region':region,'bootstrap':replica+1,'of':replicates,'seconds':round(time.time()-started,1)}),flush=True)
        boot=np.stack(boot)
        alternatives=[]
        q=np.average(yp,weights=nn,axis=0);sticky=np.tile(q*.2,(R,1))
        for r,g in enumerate(data['sourceGroups']):
            destination=next((j for j,c in enumerate(data['targetGroups']) if c['key']==g['key']),None)
            if destination is None:sticky[r]=q
            else:sticky[r,destination]+=.8
        specs=[(ridge/10,nn,None,1e-6),(ridge*10,nn,None,1e-6),(ridge,np.ones(len(nn)),None,1e-6),(ridge,np.sqrt(nn),None,1e-6),(ridge,nn,sticky,1e-6),(ridge,nn,None,1e-4)]
        for number,(penalty,weight,prior,floor) in enumerate(specs):
            PA,_=fit_rates(xp,yp,weight,penalty,prior,initial=P)
            FA,_,_=calibrate(PA,xx,yy,floor=floor)
            alternatives.append(FA);alt_national[number]+=FA.sum(axis=0)
        alternatives=np.stack(alternatives)
        low,high=sensitivity_range(boot,alternatives,point);lower[ix]=low;upper[ix]=high
        for uf,positions in uf_indices.items():
            sp=point[positions].sum(axis=0);sb=boot[:,positions].sum(axis=1);sa=alternatives[:,positions].sum(axis=1)
            sl,sh=sensitivity_range(sb,sa,sp)
            states[uf]={'matrix':sp.tolist(),'low':sl.tolist(),'high':sh.tolist(),'X':xx[positions].sum(axis=0).astype(int).tolist(),'Y':yy[positions].sum(axis=0).astype(int).tolist(),'region':region,'units':len(positions)}
        diagnostics.append({'region':region,'units':len(ix),'ridge':ridge,'crossValidation':cv,'optimizerIterations':iterations,'calibrationIterations':steps,'maxCalibrationResidualBeforeRounding':calibration_error,'weightedInSampleMAEpp':mae.tolist(),'rates':P.tolist(),'seconds':round(time.time()-started,2)})
        print(json.dumps({'region':region,'complete':True,'seconds':round(time.time()-started,1)}),flush=True)
    nl,nh=sensitivity_range(boot_national,alt_national,national)
    model={'version':2,'kind':'own-exploratory-ecological-estimate','checkedAt':data['checkedAt'],'builtAt':'2026-10-27','seed':SEED,'replicates':replicates,'sourceDigest':data['sourceDigest'],'sourceFileCount':data['sourceFileCount'],'sourceGroups':data['sourceGroups'],'targetGroups':data['targetGroups'],'national':{'matrix':national.tolist(),'low':nl.tolist(),'high':nh.tolist(),'X':X.sum(axis=0).astype(int).tolist(),'Y':Y.sum(axis=0).astype(int).tolist(),'units':len(X)},'states':states,'diagnostics':diagnostics,'method':{'family':'constrained ecological regression + entropic margin calibration','trainingUnit':'municipality or foreign voting location','constantRatesWithin':'macroregion; exterior fitted separately','weights':'registered common-base count','regularization':'ridge chosen among four strengths by 3-fold validation; largest within 1% of best error','calibrationFloor':1e-6,'uncertainty':'envelope of bootstrap 5th/95th percentiles and six sensitivity specifications; not validated confidence coverage','observedIndividualVotes':False,'physicalVoteAudit':False},'software':{'python':platform.python_version(),'numpy':np.__version__,'scipy':scipy.__version__}}
    (out/'model.json').write_text(json.dumps(model,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    for uf in sorted(states):
        cities={u['id']:{'name':u['name'],'tse':u['code'],'matrix':points[i].tolist(),'low':lower[i].tolist(),'high':upper[i].tolist(),'X':u['X'],'Y':u['Y'],'registered':u['registered']} for i,u in enumerate(data['units']) if u['uf']==uf}
        (out/(uf.lower()+'.json')).write_text(json.dumps({'version':2,'uf':uf,'kind':'regional-model-local-calibration','cities':cities},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    if not (np.array_equal(points.sum(axis=2),X) and np.array_equal(points.sum(axis=1),Y)):
        raise RuntimeError('Published integer margins failed reconciliation')
    print(json.dumps({'complete':True,'units':len(X),'bootstrap':replicates,'national':national.tolist(),'output':str(out)}),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--input',default='docs/data/migration/inputs.json')
    parser.add_argument('--prototype',action='store_true')
    parser.add_argument('--output',default='docs/data/migration')
    parser.add_argument('--replicates',type=int,default=200)
    args=parser.parse_args()
    if args.prototype:prototype(args.input)
    else:run_model(args.input,args.output,args.replicates)
