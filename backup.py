from flask import Flask, render_template, request, url_for, redirect,session

from flask_login import LoginManager, UserMixin, login_user, logout_user,current_user
from werkzeug.security import generate_password_hash, check_password_hash

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String

from authlib.integrations.flask_client import OAuth

from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Access your variables
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
SECRET_KEY = os.getenv('SECRET_KEY')

# Initialize Flask App
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///database.db"
app.config['SECRET_KEY'] = SECRET_KEY

# Initialize SQLAlchemy
class Base(DeclarativeBase):
    pass

database = SQLAlchemy(model_class=Base)
database.init_app(app)


#External Authorization 11
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    jwks_uri="https://www.googleapis.com/oauth2/v3/certs",
    authorize_url="https://accounts.google.com/o/oauth2/v2/auth",
    access_token_url="https://oauth2.googleapis.com/token",
    client_kwargs={'scope': 'openid profile email'}
)


# Initialize LoginManager
login_manager = LoginManager()
login_manager.init_app(app)

# Flask-Login User Loader
@login_manager.user_loader
def load_user(user_id):
    return database.session.get(User, user_id)

class User(UserMixin, database.Model): 
    id = mapped_column(Integer, primary_key=True)
    username = mapped_column(String)
    email = mapped_column(String)
    password = mapped_column(String, nullable=True)
    icon = mapped_column(String, nullable=True,default='./static/assets/anynomous.jpg')

# Initialize the Database
with app.app_context():
    database.create_all()

# Global current_user (for simplicity)
current_user = None

# Context Processor for Common Variables
@app.context_processor
def common_variable():
    return dict(current_user=current_user)

# Routes
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/register", methods=['POST', 'GET'])
def register():
    global current_user
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = generate_password_hash(request.form.get('password'), method='pbkdf2:sha256', salt_length=8)
        
        new_user = User(username=username, email=email, password=password)
        database.session.add(new_user)
        database.session.commit()
        session['username'] = username
        login_user(new_user)
        current_user = new_user
        return redirect(url_for("index"))
    return render_template("register.html")

@app.route("/login", methods=['POST', 'GET'])
def login():
    global current_user
    if request.method == "POST":
        email_input = request.form.get("email")
        password_input_data = request.form.get("password")
        selected_user = database.session.execute(database.select(User).filter(User.email == email_input)).scalar()
        
        if selected_user: 
            if check_password_hash(selected_user.password, password_input_data):
                session['username'] = selected_user.username
                login_user(selected_user)
                current_user = selected_user
                return redirect(url_for("index"))
            else:
                return "Wrong Password"
        else:
            return f"No email registered with this {email_input}"
    return render_template("login.html")

@app.route('/logout')
def logout():
    global current_user
    current_user = None
    session.pop('username', None)
    logout_user()
    return redirect(url_for('index'))

#login for google  22
@app.route('/login/google')
def login_google():
    try:
        redirect_uri = url_for('authorize_google',_external=True)
        return google.authorize_redirect(redirect_uri)
    except Exception as e:
        app.logger.error(f"Error during Google login {e}")
        return "Error occured during login",500
    
#authorize for google
@app.route('/authorize/google')
def authorize_google():
    global current_user
    token = google.authorize_access_token()
    userinfo_endpoint = google.server_metadata['userinfo_endpoint']
    res = google.get(userinfo_endpoint)
    user_info = res.json()
    
    email  = user_info['email']
    given_name = user_info['given_name']
    google_profile_picture = user_info['picture']
    
    user = User.query.filter_by(email = email).first()  
    if user:
        database.session.commit()
        session['username'] = user.username
        session['oauth_token'] = token
    if not user:  #registration code pending
        new_user = User(username = given_name,email = email , icon = google_profile_picture)
        database.session.add(new_user)
        database.session.commit()
    current_user = user
    return redirect(url_for("index"))
    

# Run the Application
if __name__ == "__main__":
    app.run(debug=True)
