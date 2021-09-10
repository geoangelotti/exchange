import requests
import json
import random
import time


def send_request():
    body = {
        "type": random.choice(['limit', 'limit', 'limit', 'limit', 'limit', 'market']),
        "side": random.choice(['sell', 'buy']),
        "quantity": random.random() * random.choice([7, 13, 17])
    }
    if body["type"] == 'limit':
        body["price"] = random.random()
    print(json.dumps(body))
    req = requests.post('http://localhost:3000/order', json=body)
    print(req.json())


if __name__ == "__main__":
    send_request()
    while(True):
        time.sleep(0.010)
        send_request()
