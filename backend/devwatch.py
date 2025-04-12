import subprocess

from watchgod import run_process


def start():
    print("🔄 Running migrations...")
    subprocess.run(["python", "manage.py", "migrate"])
    print("🚀 Starting Daphne...")
    subprocess.run(
        [
            "daphne",
            "--bind",
            "0.0.0.0",
            "--port",
            "8000",
            "freelancequest.asgi:application",
        ]
    )


if __name__ == "__main__":
    run_process(path=".", target=start)
