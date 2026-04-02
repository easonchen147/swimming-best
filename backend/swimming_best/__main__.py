from __future__ import annotations

from swimming_best.app import create_app


def main() -> None:
    app = create_app()
    app.run(
        host=app.config["SERVER_HOST"],
        port=int(app.config["SERVER_PORT"]),
        debug=False,
    )


if __name__ == "__main__":
    main()
