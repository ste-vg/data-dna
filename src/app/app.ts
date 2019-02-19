import './app.scss';
import Image_Me from './me.png';
import HTML from './app.html';
import { Component } from '../common/component';

export class App extends Component
{
    private _container:HTMLElement | null = null;
    private svg:SVGElement;
    private width:number = 0;
    private height:number = 0;
    private lineTop:SVGPathElement;
    private lineBottomOver:SVGPathElement;
    private lineBottomUnder:SVGPathElement;

    private amplitude = 10; // wave amplitude
    private rarity = 1; // point spacing
    private freq = 0.1; // angular frequency
    private phase = 0; 

    private data = [
        'panasky',
        'panasky',
        'panasky',
        'panasky'
    ]

    constructor(container:Element)
    {
        super('app', HTML, container, () => this.onInit());

        // create elements

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

        // 

        this.lineTop = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.lineTop.setAttribute("class", "line");
        this.lineTop.style.stroke = 'red';
        this.svg.appendChild(this.lineTop);

        this.lineBottomOver = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.lineBottomOver.setAttribute("class", "line");
        this.lineBottomOver.style.stroke = 'blue';
        this.svg.appendChild(this.lineBottomOver);

        this.lineBottomUnder = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.lineBottomUnder.setAttribute("class", "line");
        this.lineBottomUnder.style.stroke = 'green';
        this.svg.appendChild(this.lineBottomUnder);

        
    }

    private onInit()
    {
        this._container = document.getElementById('root');
        if(this._container)
        {
            this._container.appendChild(this.svg);
            
            window.addEventListener('resize', () => this.onResize())
            this.onResize();

            // TODO:
            // USE DASHED LINE TO HAVE LINES GO OVER AND UNDER


        }
    }

    private draw()
    {

    }

    onResize()
	{
        if(this._container)
        {
            this.width = this._container.offsetWidth;
            this.height = this._container.offsetHeight;

            this.svg.setAttribute('width', String(this.width));
            this.svg.setAttribute('height', String(this.height));
        }
	}
}