import json
import requests
import os

url = "https://img.pokemondb.net/sprites/heartgold-soulsilver/normal/"
j = []
with open("pokemon.json", encoding='utf-8') as f:
    j = json.load(f)


name = ""

png = ".png"
#print(j)

#run with a value of 151 in ~loginserver/images
for i in range(151):

    name = (j[i]['name']).lower()



    r = requests.get(url + name + png)
    print (url + name + png)

    with open(name + png, "wb") as f:
        f.write(r.content)
