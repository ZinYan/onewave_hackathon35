from django.apps import AppConfig


def _start_optional_scheduler():
    try:
        from .scheduler import start_scheduler

        start_scheduler()
    except Exception:
        # Scheduler failures should not break app startup; errors logged inside scheduler module.
        pass


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        super().ready()
        _start_optional_scheduler()
