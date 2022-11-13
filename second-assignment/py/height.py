import csv
import json

def get_height(infile_geo):
    with open(infile_geo, 'r') as geo:
        data = json.load(geo)
        features = data['features']
        heights = [str(feature['properties']['Height (m)']) for feature in features[:-1]]
    return heights

def export_to_csv(heights):
    with open('heights.csv', 'w') as f:
        writer = csv.writer(f)
        writer.writerow(['Height'])
        for height in heights:
            writer.writerow([height])

def main():
    heights = get_height("../../dsets/geo_data_trees.geojson")
    export_to_csv(heights)

if __name__ == "__main__":
    main()
