import csv
import json

def get_abundance_sorted(infile_geo):
    fdict = {}
    with open(infile_geo, 'r') as geo:
        data = json.load(geo)
        features = data['features']
        for feature in features[:-1]:
            tree_name = feature['properties']['Name']
            canopy = float(feature['properties']['Canopy Cover (m2)'])
            if tree_name in fdict:
                fdict[tree_name][0] += 1
                fdict[tree_name][1] += canopy
            else:
                fdict[tree_name] = [1, canopy]
    sorted_values = sorted(fdict.values(), reverse=True)
    sorted_dict = {}
    for i in sorted_values:
        for k in fdict.keys():
            if fdict[k] == i:
                sorted_dict[k] = [fdict[k][0], round(fdict[k][1] / fdict[k][0], 2)]
    return sorted_dict

def export_to_csv(fdict):
    with open('abundance.csv', 'w') as f:
        writer = csv.writer(f)
        writer.writerow(['Name', 'Count', 'Canopy'])
        for key, value in fdict.items():
           writer.writerow([key, value[0], value[1]])

def main():
    abnd = get_abundance_sorted("../dset/geo_data_trees.geojson")
    export_to_csv(abnd)

if __name__ == "__main__":
    main()
