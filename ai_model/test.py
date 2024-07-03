import requests

url = 'http://localhost:5000/prediction'

data = {
    'post_id': 1,
    'comment': 'this is bad car'
}

response = requests.post(url, json=data)
print(response.json())
