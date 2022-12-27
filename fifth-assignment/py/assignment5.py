import csv
import json
import itertools

def get_abundance_sorted(infile_geo):
    fdict = {}
    with open(infile_geo, 'r') as geo:
        data = json.load(geo)
        features = data['features']
        for feature in features[:-1]:
            tree_name = feature['properties']['Name']
            carbon = float(feature['properties']['Carbon Storage (kg)'])
            euro = float(feature['properties']['Total Annual Benefits (eur/yr)'])
            if tree_name in fdict:
                fdict[tree_name][0] += 1
                fdict[tree_name][1] += carbon
                fdict[tree_name][2] += euro
            else:
                fdict[tree_name] = [1, carbon, euro]
    sorted_values = sorted(fdict.values(), reverse=True)
    sorted_dict = {}

    for i in sorted_values:
        for k in fdict.keys():
            if fdict[k] == i:
                sorted_dict[k] = [fdict[k][0], round(fdict[k][1], 3), round(fdict[k][2],3)]

    sorted_dict =dict(itertools.islice(sorted_dict.items(), 10))
    print(sorted_dict)
    return sorted_dict

def export_to_csv(fdict):
    with open('assignment5.csv', 'w') as f:
        writer = csv.writer(f)
        writer.writerow(['Name', 'Count', 'Carbon', 'Euro'])
        for key, value in fdict.items():
           writer.writerow([key, value[0], value[1], value[2]])

def main():
    abnd = get_abundance_sorted("geo_data_trees.geojson")
    export_to_csv(abnd)

if __name__ == "__main__":
    main()
