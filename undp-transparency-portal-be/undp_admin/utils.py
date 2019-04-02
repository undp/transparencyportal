from undp_admin.models import LOG_STATUSES, AdminLog
from django.conf import settings as main_settings

db = main_settings.DB_FOR_WRITE


def add_admin_log(job, start_time, file_name="", end_time=None, status=""):
    if not status:
        status = LOG_STATUSES.in_progress
    AdminLog.objects.using(main_settings.DB_FOR_READ).create(job=job, file_name=file_name, status=status,
                                                             start_time=start_time, end_time=end_time)


def update_admin_log(job, start_time, file_name="", end_time=None, status="", message=""):
    try:
        print(job)
        print(start_time)
        admin_log = AdminLog.objects.using(main_settings.DB_FOR_READ).get(job=job,
                                                                          file_name=file_name,
                                                                          status=LOG_STATUSES.in_progress)

        admin_log.end_time = end_time
        admin_log.status = status
        admin_log.duration = str(end_time - start_time)
        admin_log.message = message
        admin_log.save()
    except Exception as e:
        print(e)
        pass
