#TODO: rewrite this in terms of react/next

import requests
from bs4 import BeautifulSoup
import json

class Scrape:
    @staticmethod
    def data():
        url = 'https://www.utsc.utoronto.ca/studentexperience/study-space'
        response = requests.get(url)

        soup = BeautifulSoup(response.text, 'html.parser')


        tables = soup.find_all('table') #returns list of all table tags 
        data = {
            "study_spaces" : []
        }
        count = 0

        # print the first table's rows (tables[0] is the only table on the site, we use this just to be safe)

        for row in tables[0].find_all('tr')[1:]: #loop through all of the rows of the table (exclude the first row bc its just the header)
            count += 1
            cells = row.find_all(['td'])         #find current row's td tags (text), returns list (note: includes html tags)
            row_text = []                        # list to store all text elements in the row
            for cell in cells:                   #loop through the list in the cells list (ie: text elements)
                text = cell.text.strip()
                row_text.append(text)
                
            entry = {
                    'Building': row_text[0],
                    'Room Number': row_text[1],
                    'Seating Spaces': row_text[2],
                    'Group/Individual': row_text[3],
                    'Type of space': row_text[4]
                }
            data["study_spaces"].append(entry)

        return json.dumps(data, indent=2)
