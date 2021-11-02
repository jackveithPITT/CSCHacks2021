



#please note that while this program resides in the folder /loginserver/"python imaging",
#it is meant to be taken out of the folder and run in /loginserver as it inserts
#into /loginserver/images. I have kept it in here for personal organization purposes.

import json
import requests
import os

url = "https://img.pokemondb.net/sprites/heartgold-soulsilver/normal/"
url2 = "https://img.pokemondb.net/sprites/sword-shield/icon/"
j = []
with open("./data/pokemon.json", encoding='utf-8') as f:
    j = json.load(f)


name = ""

png = ".png"
#print(j)

#this program is meant to be run in /loginserver

#run with a value of 151 in ~loginserver/
#for both full images and icons
for i in range(151):

    name = (j[i]['name']).lower()
    name = name.replace("\'", "")
    name = name.replace(" ", "-")
    name = name.replace(".", "")
    name = name.replace("♂", "-m")
    name = name.replace("♀", "-f")



    r = requests.get(url + name + png)
    print (url + name + png)

    with open("./images/" + name + png, "wb") as f:
        f.write(r.content)
