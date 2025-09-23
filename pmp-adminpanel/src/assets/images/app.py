# # app.py
# import cv2
# import time
# import numpy as np
# from config import RTSP_URL, LOG_INTERVAL
# from detector import detect_people, check_and_log_cabins
# from auth import authenticate_user
# from cabin_utils import load_polygons, save_polygons

# token = authenticate_user()
# if not token:
#     print("Authentication failed. Exiting.")
#     exit(1)

# cap = cv2.VideoCapture(RTSP_URL)
# cv2.namedWindow("Camera")
# cabin_polygons = load_polygons()
# current_poly = []
# last_status = [False] * len(cabin_polygons)
# last_log_time = time.time()

# def mouse_callback(event, x, y, flags, param):
#     global current_poly, cabin_polygons
#     if event == cv2.EVENT_LBUTTONDOWN:
#         current_poly.append((x, y))
#     elif event == cv2.EVENT_RBUTTONDOWN and len(current_poly) >= 3:
#         title = input("Enter cabin title: ")
#         cabin_polygons.append({"points": np.array(current_poly, dtype=np.int32), "title": title})
#         current_poly = []
#     elif event == cv2.EVENT_MBUTTONDOWN:
#         current_poly.clear()
#         cabin_polygons.clear()

# cv2.setMouseCallback("Camera", mouse_callback)

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("Stream error")
#         break

#     for pt in current_poly:
#         cv2.circle(frame, pt, 5, (255, 0, 0), -1)
#     if len(current_poly) > 1:
#         cv2.polylines(frame, [np.array(current_poly)], False, (255, 0, 0), 1)

#     boxes = detect_people(frame)
#     if time.time() - last_log_time >= LOG_INTERVAL:
#         last_status = check_and_log_cabins(frame, boxes, cabin_polygons, last_status, token)
#         last_log_time = time.time()

#     cv2.imshow("Camera", frame)
#     key = cv2.waitKey(1) & 0xFF
#     if key == ord('q'):
#         break
#     elif key == ord('s'):
#         save_polygons(cabin_polygons)

# cap.release()
# cv2.destroyAllWindows()


# app.py
from flask import (
    Flask,
    jsonify,
    render_template,
    Response,
    request,
    redirect,
    url_for,
    session,
)
from detector import CabinScanner  # Your detection & polygon logic class
import threading
import json

app = Flask(__name__)
app.secret_key = "your_secret_key"

scanner = CabinScanner()
cabin_polygons = scanner.load_polygons()


@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]
        # token = scanner.authenticate(email, password)
        data = scanner.authenticate(email, password)
        print("data", data)
        if data:
            session["token"] = data["token"]
            session["userData"] = {
                "shifts": data.get("shifts"),
            }
            return redirect(url_for("stream"))
        else:
            return render_template("login.html", error="Invalid credentials")
    return render_template("login.html")


@app.route("/stream")
def stream():
    if "token" not in session:
        return redirect(url_for("login"))

    raw_polygons = scanner.load_polygons()
    # print("polygons", raw_polygons)
    polygons = [
        {"title": poly["title"], "points": poly["points"].tolist()}
        for poly in raw_polygons
    ]

    shifts = session["userData"].get("shifts", [])

    return render_template("stream.html", polygons=json.dumps(polygons), shifts=shifts)


def generate_frames(token):
    for frame in scanner.stream_frames(token):
        if frame is None:
            continue
        yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


@app.route("/video_feed")
def video_feed():
    if "token" not in session:
        return redirect(url_for("login"))
    token = session["token"]
    shifts = session["userData"].get("shifts", [])
    print("shifts>>>>>>>>>>>", shifts, token)
    return Response(
        scanner.stream_frames(token, shifts),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


# New API: save polygons (from frontend polygon editor)
@app.route("/save_polygon", methods=["POST"])
def save_polygon():
    data = request.json
    title = data.get("title")
    points = data.get("points")
    if not title or not points:
        return jsonify({"error": "Invalid data"}), 400
    scanner.add_cabin(title, points)
    return jsonify({"status": "success"})


if __name__ == "__main__":
    app.run(debug=True)
