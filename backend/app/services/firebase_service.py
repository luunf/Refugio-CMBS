import os
import firebase_admin

from firebase_admin import credentials
from firebase_admin import auth


class FirebaseService:

    _initialized = False

    @classmethod
    def initialize(cls, app):

        if cls._initialized:
            return

        cred_path = app.config.get(
            "FIREBASE_CREDENTIALS_PATH"
        )

        if not os.path.isabs(cred_path):
            cred_path = os.path.join(
                os.getcwd(),
                cred_path
            )

        cred = credentials.Certificate(
            cred_path
        )

        firebase_admin.initialize_app(
            cred
        )

        cls._initialized = True

    @staticmethod
    def verify_token(id_token):

        try:

            return auth.verify_id_token(
                id_token,
                clock_skew_seconds=60
            )

        except Exception:
            return None

    @staticmethod
    def create_user(
        email,
        password
    ):

        try:

            user = auth.create_user(
                email=email,
                password=password
            )

            return user.uid

        except Exception as e:

            raise Exception(
                f"Error creating Firebase user: {str(e)}"
            )

    @staticmethod
    def delete_user(uid):

        try:

            auth.delete_user(uid)

            return True

        except Exception as e:

            raise Exception(
                f"Error deleting Firebase user: {str(e)}"
            )
    
    @staticmethod
    def get_user_by_email(email):
        try:
            user = auth.get_user_by_email(email)
            return user
        except auth.UserNotFoundError:
            return None
        except Exception as e:
            raise Exception(f"Error fetching Firebase user: {str(e)}")