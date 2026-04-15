var styles = [ {
  "format_version" : "1.0",
  "generated_by" : "cytoscape-3.10.4",
  "target_cytoscapejs_version" : "~2.1",
  "title" : "size_rank",
  "style" : [ {
    "selector" : "node",
    "css" : {
      "color" : "rgb(51,51,51)",
      "border-opacity" : 1.0,
      "text-opacity" : 1.0,
      "background-opacity" : 1.0,
      "width" : 12.0,
      "border-width" : 0.0,
      "border-color" : "rgb(0,0,0)",
      "font-size" : 11,
      "text-valign" : "center",
      "text-halign" : "center",
      "shape" : "rectangle",
      "height" : 12.0,
      "background-color" : "rgb(239,59,44)",
      "font-family" : "SansSerif",
      "font-weight" : "normal",
      "content" : "data(name)"
    }
  }, {
    "selector" : "node[synsetCount > 28.19680855]",
    "css" : {
      "background-color" : "rgb(37,37,37)"
    }
  }, {
    "selector" : "node[synsetCount = 28.19680855]",
    "css" : {
      "background-color" : "rgb(37,37,37)"
    }
  }, {
    "selector" : "node[synsetCount > 28.09574416][synsetCount < 28.19680855]",
    "css" : {
      "background-color" : "mapData(synsetCount,28.09574416,28.19680855,rgb(177,0,38),rgb(37,37,37))"
    }
  }, {
    "selector" : "node[synsetCount > 28.00000021][synsetCount < 28.09574416]",
    "css" : {
      "background-color" : "mapData(synsetCount,28.00000021,28.09574416,rgb(189,189,189),rgb(177,0,38))"
    }
  }, {
    "selector" : "node[synsetCount = 28.00000021]",
    "css" : {
      "background-color" : "rgb(189,189,189)"
    }
  }, {
    "selector" : "node[synsetCount < 28.00000021]",
    "css" : {
      "background-color" : "rgb(177,0,38)"
    }
  }, {
    "selector" : "node[nodeType = 'ADJ']",
    "css" : {
      "shape" : "diamond"
    }
  }, {
    "selector" : "node:selected",
    "css" : {
      "background-color" : "rgb(255,255,0)"
    }
  }, {
    "selector" : "edge",
    "css" : {
      "font-size" : 10,
      "source-arrow-shape" : "none",
      "target-arrow-shape" : "none",
      "color" : "rgb(0,0,0)",
      "width" : 2.0,
      "source-arrow-color" : "rgb(0,0,0)",
      "content" : "",
      "opacity" : 1.0,
      "line-style" : "solid",
      "text-opacity" : 1.0,
      "target-arrow-color" : "rgb(0,0,0)",
      "font-family" : "SansSerif",
      "font-weight" : "normal",
      "line-color" : "rgb(76,76,76)"
    }
  }, {
    "selector" : "edge:selected",
    "css" : {
      "line-color" : "rgb(255,0,0)"
    }
  } ]
} ]