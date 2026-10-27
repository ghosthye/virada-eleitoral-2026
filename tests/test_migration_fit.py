import importlib.util, unittest
from pathlib import Path
import numpy as np
spec=importlib.util.spec_from_file_location('migration_fit',Path(__file__).parents[1]/'scripts'/'fit-migration.py')
model=importlib.util.module_from_spec(spec);spec.loader.exec_module(model)

class NumericalValidation(unittest.TestCase):
    def test_recovers_known_constant_transition_rates_on_identifiable_synthetic_data(self):
        rng=np.random.default_rng(909)
        x=rng.dirichlet(np.ones(6)*2,size=250)
        truth=rng.dirichlet(np.ones(3)*2,size=6)
        y=x@truth
        rates,_=model.fit_rates(x,y,np.ones(250),ridge=1e-10)
        self.assertLess(np.max(np.abs(rates-truth)),.002)
        self.assertTrue(np.all(rates>=0))
        np.testing.assert_allclose(rates.sum(axis=1),1,atol=1e-10)

    def test_calibration_and_balanced_rounding_preserve_zero_cells_and_all_margins(self):
        x=np.array([[100,50,1],[0,4,7]],dtype=float)
        y=np.array([[60,90,1],[5,0,6]],dtype=float)
        rates=np.array([[.9,.09,.01],[.2,.7,.1],[.1,.1,.8]])
        flows,_,error=model.calibrate(rates,x,y,tolerance=.0001)
        self.assertLess(error,.00011)
        rounded=model.balanced_round(flows,x,y)
        np.testing.assert_array_equal(rounded.sum(axis=2),x)
        np.testing.assert_array_equal(rounded.sum(axis=1),y)
        self.assertTrue(np.all(rounded>=0))
        self.assertTrue(np.all(rounded[1,:,1]==0))

    def test_sensitivity_envelope_includes_point_bootstrap_and_specification_changes(self):
        samples=np.array([[[2,8]],[[4,6]],[[3,7]]],dtype=float)
        alternatives=np.array([[[1,9]],[[5,5]]],dtype=float)
        low,high=model.sensitivity_range(samples,alternatives,np.array([[3,7]]))
        np.testing.assert_array_equal(low,[[1,5]])
        np.testing.assert_array_equal(high,[[5,9]])

if __name__=='__main__':unittest.main()
