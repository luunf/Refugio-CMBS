from firebase_admin import auth
from app.services.firebase_service import FirebaseService
from app import create_app

app = create_app()

with app.app_context():

    FirebaseService.initialize(app)

    user = auth.get_user_by_email(
        "admin@refugiocmbs.com"

        #"usuario_admin@gmail.com" # Cambiar por el mail que sea 
    )

    auth.update_user(
        user.uid,
        email_verified=True
    )

    print("Admin verificado")


    #abrir terminal en la raiz del back y ejecutar: python verificar_admin.py