import sys
from unittest.mock import MagicMock

# Mock heavy ML dependencies that may not be installed in test environments
for mod_name in [
    'sentence_transformers',
    'torch',
    'transformers',
    'ollama',
    'openai',
]:
    if mod_name not in sys.modules:
        sys.modules[mod_name] = MagicMock()
