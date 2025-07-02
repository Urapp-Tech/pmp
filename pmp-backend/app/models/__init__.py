import os
import importlib
from pathlib import Path

models_dir = Path(__file__).resolve().parent

for file in os.listdir(models_dir):
    if file.endswith(".py") and file != "__init__.py":
        module_name = f"{__name__}.{file[:-3]}"
        importlib.import_module(module_name)
