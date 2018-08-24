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
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';

class App extends Component {
  
  constructor(props) {
    super(props);    
    this.state = {  
                    backend:'http://127.0.0.1:5000/',
                    map:undefined,
                    checkedPontoAtual:true,
                    checkedNdvi:true,
                    checkedTrueColor:true,
                    labelPontoSelecionado:'Nenhum',
                    fusoHorario:undefined,
                    horarioLocal:undefined,
                    area:undefined,
                    centroid:undefined
    };    
    this.handleCheckPontoAtual = this.handleCheckPontoAtual.bind(this);
    this.handleCheckNdvi = this.handleCheckNdvi.bind(this);
    this.handleCheckTrueColor = this.handleCheckTrueColor.bind(this);
    this.handleClickLimparPontoSelecionado = this.handleClickLimparPontoSelecionado.bind(this);
  };

  componentDidMount(){

    fetch('http://127.0.0.1:5000/inf')
    .then(res => res.json())
    .then(
      (result) => {
        console.log(result)
        this.setState({
          horarioLocal: result.timestamp,
          fusoHorario: result.provider_scene
        });
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    )

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

    const layerTrueColor = new ImageLayer({          
      source: new Static({
        url: 'http://127.0.0.1:5000/static/true_color_4326.jpg',
        imageExtent: [-45.814160325, -10.643552509, -45.762978777, -10.575508911]            
      })
    });

    const layerNdvi = new ImageLayer({          
      source: new Static({
        url: 'http://127.0.0.1:5000/static/ndvi_4326.jpg',
        imageExtent: [-45.814160325, -10.643552509, -45.762978777, -10.575508911]            
      })
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
        layerPontoAtual,
        layerNdvi,
        layerTrueColor
      ],
      view: new View({
        projection: 'EPSG:4326',
        center: [-45.80, -10.60],
        zoom: 12
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
        sourcePontoAtual:sourcePontoAtual,
        layerTrueColor:layerTrueColor,
        layerNdvi:layerNdvi
    });

  }

  handleCheckPontoAtual() {
    const checked = !this.state.checkedPontoAtual;
    this.setState({checkedPontoAtual: checked});
    this.state.layerPontoAtual.setVisible(checked);
  }

  handleCheckNdvi() {
    const checked = !this.state.checkedNdvi;
    this.setState({checkedNdvi: checked});
    this.state.layerNdvi.setVisible(checked);
  }

  handleCheckTrueColor() {
    const checked = !this.state.checkedTrueColor;
    this.setState({checkedTrueColor: checked});
    this.state.layerTrueColor.setVisible(checked);
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
            <div className="column">
              <p>Informações da cena</p>
              <p>Fuso Horário : {this.state.fusoHorario}</p>
              <p>Horário Local: {this.state.horarioLocal}</p>              
              <p>Área         : {this.state.area}</p>
              <p>Centróid     : {this.state.centroid}</p>
            </div>
            <div className="column">
              <p>Ponto Selecionado</p>
              <p>{this.state.labelPontoSelecionado}</p>
              <p>Ndvi</p>
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