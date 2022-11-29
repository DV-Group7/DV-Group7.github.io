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
        l = [
                [features[i]['properties']['nome'],
                geometry.Polygon(features[i]['geometry']['coordinates'][0]),
                features[i]['properties']['numero_cir'],
                features[i]['properties']['area'],
            ] for i in range(n_circ)]
    return l

def parse_trees(infile_geo):
    l = []
    with open(infile_geo, 'r') as geo:
        data = json.load(geo)
        features = data['features']
        for feature in features[:-1]:
            tree_id = feature['properties']['Tree ID']
            tree_name = feature['properties']['Name'].replace(" ", "_")
            tree_coord = feature['geometry']['coordinates']
            tree_ox = feature['properties']['Oxygen Production (kg/yr)']
            tree_cover = feature['properties']['Canopy Cover (m2)']
            l.append([tree_id, tree_name, geometry.Point(tree_coord[0], tree_coord[1]), tree_ox, tree_cover])
    return l

def neighborhoods_abundance(neighborhoods, trees):
    fdict = {}
    for i in range(n_circ):
        name = neighborhoods[i][0]
        poly = neighborhoods[i][1]

        for tree in trees:
            if poly.contains(tree[2]):
                if name in fdict:
                    fdict[name] = [fdict[name][0]+1, fdict[name][1]+float(tree[-1]), fdict[name][2]+float(tree[-2])]
                else:
                    fdict[name] = [1, float(tree[-1]), float(tree[-2])]
    print(fdict['MEANO'])
    return fdict

def export_csv(fdict, trees, neighborhoods):
    with open('values.csv', 'w') as f:
        writer = csv.writer(f)
        writer.writerow(['name', 'numero_cir','tree', 'density', 'oxygen', 'area'])
        for i, (key, value) in enumerate(fdict.items()):
            writer.writerow([key, neighborhoods[i][-2], value[0], value[1]/int(neighborhoods[i][-1]), value[2], neighborhoods[i][-1]])

def main():
    neighborhoods = parser_neighborhood("../dsets/circoscrizioni.json")
    trees = parse_trees("../dsets/geo_data_trees.geojson")
    # check_trees(neighborhoods, trees)
    # top_n_trees = get_top_n_trees("abundance.csv", 5)
    fdict = neighborhoods_abundance(neighborhoods, trees)
    #for k in fdict:
    #    print("{0} - {1}".format(k, fdict[k]))
    export_csv(fdict, trees, neighborhoods)

if __name__ == "__main__":
    main()


