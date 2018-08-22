import React, { Component } from 'react';
import './App.css';
import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import MousePosition from 'ol/control/MousePosition';
import OSM from 'ol/source/OSM';
import {defaults as defaultControls} from 'ol/control';
import {format} from 'ol/coordinate';
import SourceVector from 'ol/source/Vector';
import LayerVector from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

class App extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {  map:undefined,
                    checkedPontoAtual:true,
                    checkedNdvi:false,
                    checkedTrueColor:false,
                    labelPontoSelecionado:'Nenhum'
    };    

    this.handleCheckPontoAtual = this.handleCheckPontoAtual.bind(this);
    this.handleCheckNdvi = this.handleCheckNdvi.bind(this);
    this.handleCheckTrueColor = this.handleCheckTrueColor.bind(this);
    this.handleClickLimparPontoSelecionado = this.handleClickLimparPontoSelecionado.bind(this);
  };

  componentDidMount(){
    const mousePositionControl = new MousePosition({
      projection: 'EPSG:4326',
      className: 'custom-mouse-position',
      coordinateFormat: function(coord){ 
        return format(coord, 'Coordenadas: {x}, {y}', 8);
      },
      undefinedHTML: '&nbsp;'
    });
    
    const sourcePontoAtual = new SourceVector();
    const layerPontoAtual = new LayerVector({
      source: sourcePontoAtual
    });

    const map = new Map({
      target: 'map',
      controls: defaultControls({
        attributionOptions: {
          collapsible: false
        }
      }).extend([mousePositionControl]),
      layers: [
        new TileLayer({
         source: new OSM("Base", "tiles/${z}/${x}/${y}.png")
        }),
        layerPontoAtual
      ],
      view: new View({
        projection: 'EPSG:4326',
        center: [-50.41, -11.82],
        zoom: 6
      })
    });

    const me = this;

    map.on('click', function(evt){
      const source = me.state.sourcePontoAtual;
      source.clear();
      const point = new Point(evt.coordinate);
      const feature = new Feature(point);      
      source.addFeature(feature);   
      me.setState({labelPontoSelecionado:point.getCoordinates().toString()});
    });

    this.setState({
        map:map,
        layerPontoAtual:layerPontoAtual,
        sourcePontoAtual:sourcePontoAtual
    });

  }

  handleCheckPontoAtual() {
    const checked = !this.state.checkedPontoAtual;
    this.setState({checkedPontoAtual: checked});
    this.state.layerPontoAtual.setVisible(checked);
  }

  handleCheckNdvi() {
    this.setState({handleCheckNdvi: !this.state.handleCheckNdvi});
  }

  handleCheckTrueColor() {
    this.setState({checkedTrueColor: !this.state.checkedTrueColor});
  }

  handleClickLimparPontoSelecionado(){
    const source = this.state.sourcePontoAtual;
    source.clear();
    this.setState({labelPontoSelecionado:'Nenhum'});
  }

  render() {
    return (
      <div className="App">
        <main>
          <div id="map" className="map"></div>   
        </main>
        <footer>
          <div className="row">
            <div className="column">
              <p>Camadas</p>
              <div><p><input type="checkbox" onChange={this.handleCheckPontoAtual} defaultChecked={this.state.checkedPontoAtual}/>Ponto Atual</p></div>
              <div><p><input type="checkbox" onChange={this.handleCheckNdvi} defaultChecked={this.state.checkedNdvi}/>NDVI</p></div>
              <div><p><input type="checkbox" onChange={this.handleCheckTrueColor} defaultChecked={this.state.checkedTrueColor}/>True Color</p></div>
            </div>
            <div className="column">Histograma de NDVI</div>
            <div className="column">Informações da cena</div>
            <div className="column">
              <p>Ponto Selecionado</p>
              <p>{this.state.labelPontoSelecionado}</p>
              <button className="btn btn-default" onClick={this.handleClickLimparPontoSelecionado} >Limpar ponto selecionado</button>            
            </div>
          </div> 
        </footer>        
      </div>
    );
  }
}

export default App;

