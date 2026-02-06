import atexit
import logging
import os

from apscheduler.schedulers.background import BackgroundScheduler
from django.conf import settings

from .opportunity_utils import run_opportunity_pipeline

logger = logging.getLogger(__name__)
_scheduler: BackgroundScheduler | None = None


def start_scheduler() -> None:
    global _scheduler
    if not settings.OPPORTUNITY_SCHEDULER_ENABLED:
        return
    if _scheduler is not None:
        return

    if os.environ.get("RUN_MAIN") == "true" or not settings.DEBUG:
        interval = max(5, settings.OPPORTUNITY_SCHEDULER_INTERVAL_MINUTES)
        _scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)
        _scheduler.add_job(
            _execute_pipeline,
            "interval",
            minutes=interval,
            id="opportunity-pipeline",
            max_instances=1,
            replace_existing=True,
        )
        _scheduler.start()
        atexit.register(stop_scheduler)
        logger.info(
            "Opportunity scheduler started",
            extra={"interval_minutes": interval},
        )


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler is None:
        return
    _scheduler.shutdown(wait=False)
    _scheduler = None
    logger.info("Opportunity scheduler stopped")


def _execute_pipeline() -> None:
    try:
        summary = run_opportunity_pipeline()
        logger.info("Opportunity pipeline run", extra=summary)
    except Exception:
        logger.exception("Scheduled opportunity pipeline failed")
