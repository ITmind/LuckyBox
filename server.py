
from flask import Flask, escape, request, send_from_directory, render_template
import os


app = Flask(__name__,
            static_folder=os.path.join('.', 'data_uncompressed'))


@app.route('/')
def root():
    return send_from_directory('data_uncompressed', 'index.html')


@app.route('/SensorsOut')
def SensorsOut():
    print('sensout')
    return '{}'
# @app.route('/<path:file>')
# def serve_results(file):
#     pat = os.path.join('.', 'data_uncompressed')
#     print(f'{file=}  {pat=}')
#     return send_from_directory(pat, file)

# @app.route('/')
# def index():
#     name = request.args.get("name", "World")
#     f = open('.\index.htm', 'r', encoding='utf_8_sig')
    # return f.read()


app.run(debug=True)
