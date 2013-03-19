import bottle
from beaker.middleware import SessionMiddleware
from app.views import *

session_opts = {
    'session.type': 'redis',
    'session.url': '127.0.0.1:6379',
    'session.key': 'workdays',
    'session.cookie_expires': False,
}


class StripPathMiddleware(object):
    """ Allow trailing / on urls, but strips them out. """
    def __init__(self, app):
        self.app = app

    def __call__(self, e, h):
        e['PATH_INFO'] = e['PATH_INFO'].rstrip('/')
        return self.app(e, h)

app = SessionMiddleware(bottle.default_app(), session_opts)
app = StripPathMiddleware(app)


@bottle.route('/static/:filename#.*#')
def server_static(filename):
    return bottle.static_file(filename, root='./static/')


import socket
# Deployed on server, run via uwsgi
if socket.gethostname()[-5:] == "-prod":
    application = app
# Local development, use build in bottle server
else:
    bottle.run(port=8003, reloader=True, app=app, debug=True)