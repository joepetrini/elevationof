import smtplib
import string
import inspect
from bottle import TEMPLATE_PATH, jinja2_template as template


TEMPLATE_PATH.append('./templates')
session_app_key = 'elevationof_'


def render(request, templateName, params={}):
    mobile = isMobile(request)
    params['mobile'] = mobile
    params['view'] = inspect.stack()[1][3]
    if mobile:
        return template(templateName+'_mob.htm', params)
    else:
        return template(templateName+'.htm', params)


def isMobile(request):
    user_agent = request.headers.get('User-Agent', '').lower()
    if 'iphone' in user_agent:
        return True
    if ('andrioid' in user_agent) and ('mobile' in user_agent):
        return True
    if 'blackberry' in user_agent:
        return True
    return False


def setSession(request, key, value):
    session = request.environ.get('beaker.session')
    session[session_app_key+key] = value
    session.save()


def getSession(request, key, default=None):
    session = request.environ.get('beaker.session')
    key = session_app_key + key
    if key in session:
        return session[key]
    else:
        return default


def sendMail(userEmail, message):
    sendFrom = 'noreply@elevationof.com'
    sendTo = 'joepetrini@gmail.com'
    message = "From: %s \r\n %s" % (userEmail, message)
    body = string.join((
        "From: %s" % sendFrom,
        "To: %s" % sendTo,
        "Subject: %s" % 'Feedback from elevationof.com',
        "",
        message
    ), "\r\n")
    server = smtplib.SMTP('localhost')
    server.sendmail(sendFrom, [sendTo], body)
    server.quit()
