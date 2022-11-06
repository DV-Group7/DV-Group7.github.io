import json
import csv
from shapely import geometry
from collections import defaultdict
import matplotlib.pyplot as plt
import itertools

n_circ = 12

def parser_neighborhood(infile_circoscrizioni):
    with open(infile_circoscrizioni, 'r') as circ:
        data = json.load(circ)
        features = data['features']
        l = [[features[i]['properties']['nome'],
            geometry.Polygon(features[i]['geometry']['coordinates'][0])] for i in range(n_circ)]
    return l

def parser_trees(infile_geo):
    l = []
    with open(infile_geo, 'r') as geo:
        data = json.load(geo)
        features = data['features']
        for feature in features[:-1]:
            tree_id = feature['properties']['Tree ID']
            tree_name = feature['properties']['Name'].replace(" ", "_")
            tree_coord = feature['geometry']['coordinates']
            l.append([tree_id, tree_name, geometry.Point(tree_coord[0], tree_coord[1])])
    return l

"""
def check_trees(neighborhoods, trees):
    final = []
    nbhood = []
    for i in range(n_circ):
        neighborhood = neighborhoods[i][1]
        x, y = neighborhood.exterior.xy
        plt.plot(x,y)
        for tree in trees:
            if neighborhood.contains(tree[2]):
                nbhood.append(tree)
                plt.plot(tree[2].x,tree[2].y,'ro')
        final.append(nbhood)
        nbhood = []
        plt.show()
    return final
"""

def get_top_n_trees(abundance_csv, n):
    rows = []
    with open(abundance_csv, 'r') as f:
        reader = csv.reader(f)
        header = next(reader)
        tmp = 0
        for row in reader:
            tmp += 1
            rows.append(row[0])
            if tmp == n:
                break
    return rows

def neighborhoods_abundance(neighborhoods, trees, top_n_trees):
    fdict = {}
    flag = True
    for i in range(n_circ):
        name = neighborhoods[i][0]
        poly = neighborhoods[i][1]

        fdict[name] = {key: 0 for key in top_n_trees+["Others"]}
        for tree in trees:
            if poly.contains(tree[2]):
                for tree_name in top_n_trees:
                    if tree[1] == tree_name:
                        fdict[name][tree_name] += 1
                        flag = False
                if flag:
                    fdict[name]["Others"] += 1
                flag = True
    return fdict

def export_abundance_csv(dic, top_n_trees):
    with open("circoscrizioni.csv", "w") as f:
        w = csv.DictWriter(f, ["Circoscrizioni"]+top_n_trees+["Others"])
        w.writeheader()
        for key, val in sorted(dic.items()):
            row = {'Circoscrizioni': key}
            row.update(val)
            w.writerow(row)

def main():
    neighborhoods = parser_neighborhood("../dsets/circoscrizioni.json")
    trees = parser_trees("../dsets/geo_data_trees.geojson")
    # check_trees(neighborhoods, trees)
    top_n_trees = get_top_n_trees("abundance.csv", 5)
    fdict = neighborhoods_abundance(neighborhoods, trees, top_n_trees)
    #for k in fdict:
    #    print("{0} - {1}".format(k, fdict[k]))
    export_abundance_csv(fdict, top_n_trees)

if __name__ == "__main__":
    main()

