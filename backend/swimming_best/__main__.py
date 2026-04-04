from __future__ import annotations

import os

from waitress import serve

from swimming_best.app import create_app


def main() -> None:
    app = create_app()
    host = str(app.config["SERVER_HOST"])
    port = int(app.config["SERVER_PORT"])

    if os.environ.get("SWIMMING_BEST_USE_FLASK_DEV") == "1":
        app.run(
            host=host,
            port=port,
            debug=False,
        )
        return

    serve(
        app,
        host=host,
        port=port,
        threads=int(os.environ.get("SWIMMING_BEST_WAITRESS_THREADS", "8")),
    )


if __name__ == "__main__":
    main()
