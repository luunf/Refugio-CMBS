import os
import firebase_admin
from firebase_admin import credentials, auth
from flask import current_app

class FirebaseService:
    _initialized = False  # Atributo de clase

    @classmethod
    def initialize(cls, app):

        if not cls._initialized:

            cred_path = app.config.get(
                "FIREBASE_CREDENTIALS_PATH"
            )

            print("========== FIREBASE ==========")
            print("PATH:", cred_path)

            if not os.path.isabs(cred_path):
                cred_path = os.path.join(
                    os.getcwd(),
                    cred_path
                )

            print("ABS PATH:", cred_path)
            print("EXISTS:", os.path.exists(cred_path))

            cred = credentials.Certificate(
                cred_path
            )

            print("PROJECT ID:")
            print(cred.project_id)

            firebase_admin.initialize_app(
                cred
            )

            print("FIREBASE INIT OK")

            try:

                users = auth.list_users()

                for u in users.iterate_all():
                    print(
                        "FIRST USER:",
                        u.email
                    )
                    break

                print(
                    "FIREBASE LIST USERS OK"
                )

            except Exception as e:

                print(
                    "FIREBASE LIST USERS ERROR"
                )

                print(type(e))
                print(str(e))

            cls._initialized = True

    @staticmethod
    def verify_token(id_token):
        try:
            decoded_token = auth.verify_id_token(
                id_token,
                clock_skew_seconds=60
            )

            print("TOKEN VALIDO")
            print(decoded_token)

            return decoded_token

        except Exception as e:
            print("ERROR VERIFY TOKEN")
            print(type(e))
            print(str(e))

            return None

    @staticmethod
    def create_user(email, password):
        try:
            user = auth.create_user(email=email, password=password)
            return user.uid
        except Exception as e:
            raise Exception(f"Error creating Firebase user: {str(e)}")

    @staticmethod
    def delete_user(uid):
        try:
            auth.delete_user(uid)
            return True
        except Exception as e:
            raise Exception(f"Error deleting Firebase user: {str(e)}")