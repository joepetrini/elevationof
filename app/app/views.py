from bottle import route, request
from utils import render


@route('/')
def index():
    """Main landing page"""
    return render(request, 'index', {})
