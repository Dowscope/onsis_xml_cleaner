import pandas as pd

file_loc = 'C:\\rea\\'
file_name = '20212022_REA_Oct_Submission_CSV.csv' 
file_path = file_loc + file_name

data = pd.read_csv(file_path, index_col=0)

print (data)