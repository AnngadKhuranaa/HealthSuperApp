"""
Pytest configuration — adds the backend root to sys.path so imports work.
"""
import sys
import os

# Make sure `app` is importable when running pytest from the backend directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
