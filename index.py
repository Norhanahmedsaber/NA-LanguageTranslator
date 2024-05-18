import json
import json
from graphviz import Digraph
import os
import platform  # To detect the operating system

def add_nodes_edges(tree, dot=None, parent=None, color_map=None, terminal_color='gold'):
    if dot is None:
        dot = Digraph(engine='dot')
        dot.attr('node', shape='ellipse', style='filled', fontname='Helvetica-Bold', fontsize='14')
        dot.attr('edge', fontname='Helvetica-Bold', fontsize='12', arrowsize='0.5')
        dot.attr('graph', size='15,15', ratio='auto', pad='0.5', nodesep='0.5', ranksep='1', dpi='300')

    node_label = tree.get('Node', 'Unknown')

    node_name = f"{id(tree)}"

    # Check if the node is a terminal symbol
    if node_label in terminals:
        node_color = terminal_color  # Set uniform color for terminals
    else:
        node_color = color_map.get(tree['Node'], '#B387E6')  # Default color if not specified

    if 'value' in tree:
        node_label += f": {tree['value']}"
    dot.node(node_name, label=node_label, color=node_color)

    if parent is not None:
        dot.edge(parent, node_name)

    if 'Children' in tree:
        for child in tree['Children']:
            add_nodes_edges(child, dot, parent=node_name, color_map=color_map, terminal_color=terminal_color)

    return dot

# Define your tree here
json_tree = ""
with open('input.txt', 'r') as file:
    json_tree = file.read()
tree_dict = json.loads(json_tree)

# Define a color map for node types and terminals
color_map = {
    # Continue for other non-terminal nodes as needed
}
terminals = ["Identifier", "Number", ";", ":", "{", "}", "+", "-", "*", "/", "=", "!", ">", "<", "(", ")", "if", "else", "while", "switch", "case", "break", "default", "do", "for", "||", "&&"]
color_map.update({term: None for term in terminals})  # Map terminals to None to later check and set a uniform color

dot = add_nodes_edges(tree_dict, color_map=color_map)
dot.format = 'png'
file_path = dot.render('parse_tree_complete')

# Automatically open the generated file based on OS
if platform.system() == "Windows":
    os.startfile(file_path)
elif platform.system() == "Darwin":  # macOS
    os.system(f'open {file_path}')
elif platform.system() == "Linux":
    os.system(f'xdg-open {file_path}')