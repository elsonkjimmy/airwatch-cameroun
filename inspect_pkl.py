import pickle
import sys
import types
import io

main_mod = sys.modules["__main__"]

class AirWatchLSTM: pass
class LSTMRegressor: pass
class XGBPollutionClassifier: pass
class AirWatchPipeline: pass

main_mod.AirWatchLSTM = AirWatchLSTM
main_mod.LSTMRegressor = LSTMRegressor
main_mod.XGBPollutionClassifier = XGBPollutionClassifier
main_mod.AirWatchPipeline = AirWatchPipeline

class CPUUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module == "torch.storage" and name == "_load_from_bytes":
            import torch
            return lambda b: torch.load(io.BytesIO(b), map_location="cpu", weights_only=False)
        return super().find_class(module, name)

try:
    with open("backend/models/airwatch_pipeline_v2.pkl", "rb") as f:
        pipe = CPUUnpickler(f).load()
    print("KEYS:", pipe.__dict__.keys())
except Exception as e:
    import traceback
    traceback.print_exc()

