## Documentation

Please see the below customized documentation steps to run data-catalog locally . 

## Requirements

- Python = 3.6 or 3.7
- Node = v10 or v12 (v14 may have compatibility issues)
- npm >= 6

## Steps By Step setup to connect with ORACLE using Driver + Dialect 

- Driver : Oracle
- Dialect : Cx_Oracle

- Go to databuilder folder using cd databuilder in the Teeminal
- Execute below command individually 

- $ python -m venv venv
- $ venv/Scripts/activate
- $ pip3 install --upgrade pip
- $ pip3 install -r requirements.txt
- $ python setup.py install
- $ python example/scripts/sample_oracle_loader.py


## To load specific schema 

- Open sample_oracle_loader.py file and update the Connecting string 
-    . usernmae
-    . password
-    . host
-    . port
-    . servicename

 ## Assign Schema name here 

- def run_oracle_job():
-    where_clause_suffix = textwrap.dedent("""
-        where c.owner = 'CIGADMIN' 
-    """)

 ## Login and validate 

 - http://localhost:5000/
 - http://localhost:7474/browser/
 - http://localhost:5002/apidocs
