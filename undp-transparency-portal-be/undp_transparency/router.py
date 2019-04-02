from django.conf import settings


class PrimaryRouter:
    def db_for_read(self, model, **hints):
        """
        Reads go to DB_ALIAS.
        """
        return settings.DB_FOR_READ

    def db_for_write(self, model, **hints):
        """
        Writes always go to primary.
        """
        return settings.DB_FOR_WRITE

    def allow_relation(self, obj1, obj2, **hints):

        if obj1._state.db == obj2._state.db:
            return True

        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        All non-auth models end up in this pool.
        """
        return True


class AuthRouter:
    """
    A router to control all database operations on models in the
    auth application.
    """
    def db_for_read(self, model, **hints):
        """
        Attempts to read auth models go to auth_db.
        """
        if model._meta.app_label in ['auth', 'admin', 'sessions', 'undp_admin']:
            return settings.DB_FOR_READ
        return None

    def db_for_write(self, model, **hints):
        """
        Attempts to write auth models go to auth_db.
        """
        if model._meta.app_label in ['auth', 'admin', 'sessions', 'undp_admin']:
            return settings.DB_FOR_READ
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if a model in the auth app is involved.
        """
        if obj1._meta.app_label == 'auth' or obj2._meta.app_label == 'auth':
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure the auth app only appears in the 'auth_db'
        database.
        """
        if app_label == 'auth':
            return True
        return None
