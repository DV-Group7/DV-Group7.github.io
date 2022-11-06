import json
import csv

def feature_to_row(feature, header):
    l = [feature['properties'][k] for k in header]
    if feature['geometry'] is None:
        coords = []
    else:
        coords = feature['geometry']['coordinates']
        assert(len(coords)==2)
        l.extend(coords)
    return l

def parse(infile, outfile):
    with open(infile, 'r') as geo_file:
        with open(outfile, 'w', newline='') as csv_file:
            geojson_data = json.load(geo_file)
            features = geojson_data['features']
            csv_writer = csv.writer(csv_file)
            is_header = True
            header = []
            for feature in features:
                if is_header:
                    is_header = False
                    header = list(feature['properties'].keys())
                    header.extend(['px','py'])
                    csv_writer.writerow(header)
                csv_writer.writerow(feature_to_row(feature, feature['properties'].keys()))

def main():
    parse("../dset/geo_data_trees.geojson", "geo_data_trees.csv")

if __name__ == "__main__":
    main()
