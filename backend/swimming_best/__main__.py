from __future__ import annotations

import os
import sys

from swimming_best.app import create_app


def run_flask_dev() -> None:
    app = create_app()
    app.run(
        host=str(app.config["SERVER_HOST"]),
        port=int(app.config["SERVER_PORT"]),
        debug=False,
    )


def run_waitress() -> None:
    from waitress import serve

    app = create_app()
    serve(
        app,
        host=str(app.config["SERVER_HOST"]),
        port=int(app.config["SERVER_PORT"]),
        threads=int(os.environ.get("SWIMMING_BEST_WAITRESS_THREADS", "8")),
    )


def run_gunicorn() -> None:
    from gunicorn.app.base import BaseApplication

    app = create_app()

    class StandaloneGunicornApplication(BaseApplication):
        def __init__(self, application, options: dict[str, object] | None = None):
          self.options = options or {}
          self.application = application
          super().__init__()

        def load_config(self) -> None:
          for key, value in self.options.items():
            if key in self.cfg.settings and value is not None:
              self.cfg.set(key, value)

        def load(self):
          return self.application

    options = {
        "bind": f"{app.config['SERVER_HOST']}:{int(app.config['SERVER_PORT'])}",
        "workers": int(os.environ.get("SWIMMING_BEST_GUNICORN_WORKERS", "2")),
        "threads": int(os.environ.get("SWIMMING_BEST_GUNICORN_THREADS", "4")),
        "accesslog": "-",
        "errorlog": "-",
        "timeout": int(os.environ.get("SWIMMING_BEST_GUNICORN_TIMEOUT", "60")),
    }
    StandaloneGunicornApplication(app, options).run()


def main() -> None:
    if os.environ.get("SWIMMING_BEST_USE_FLASK_DEV") == "1":
      run_flask_dev()
      return

    if sys.platform == "win32":
      run_waitress()
      return

    run_gunicorn()


if __name__ == "__main__":
    main()
