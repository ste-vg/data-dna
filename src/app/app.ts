import './app.scss';
import HTML from './app.html';
import { Component } from '../common/component';

export class App extends Component
{
    private _container:HTMLElement | null = null;
    private svg:SVGElement;
    private baseGroup:SVGElement;
    private _width:number = 0;
    private _height:number = 0;
    private lineTop:SVGPathElement;
    private lineBottomOver:SVGPathElement;
    private lineBottomUnder:SVGPathElement;

    private amplitude = 0; // wave amplitude
    private rarity = 0; // point spacing
    private freq = 0.15; // angular frequency
    private phase = 0; 
    private minBaseGap = 0;
    private padding = 10;
    private rotationSpeed = 0.075;
    private curveResolution = 10;
    private points = 0;

    private addBlanks:boolean = true;

    private data = [
        'panasky',
        'panasky',
        'panasky',
        'panasky',
        'panasky',
        'panasky',
        'panasky',
        'panasky',
        'panasky',
        'panasky',
        'panasky',
        'panasky'
    ]

    private bases:SVGLineElement[] = [];

    constructor(container:Element)
    {
        super('app', HTML, container, () => this.onInit());

        // create elements

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

        // 

        this.baseGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.appendChild(this.baseGroup);

        // 
        
        this.lineBottomUnder = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.lineBottomUnder.setAttribute("class", "line");
        this.lineBottomUnder.style.stroke = 'steelblue';
        this.svg.appendChild(this.lineBottomUnder);

        this.lineTop = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.lineTop.setAttribute("class", "line");
        this.lineTop.style.stroke = 'red';
        this.svg.appendChild(this.lineTop);

        this.lineBottomOver = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.lineBottomOver.setAttribute("class", "line");
        this.lineBottomOver.style.stroke = 'steelblue';
        
        this.svg.appendChild(this.lineBottomOver);

        
    }

    private onInit()
    {
        this._container = document.getElementById('root');

        if(this.addBlanks)
        {
            this.data.push('blank');
            this.data.unshift('blank');
        }
        if(this._container)
        {
            this._container.appendChild(this.svg);
            
            window.addEventListener('resize', () => this.onResize())
            this.onResize();

            for (let i = 0; i < this.data.length; i++) 
            {
                let base = document.createElementNS("http://www.w3.org/2000/svg", 'line');
                base.setAttribute('class', `base ${this.data[i]}`);
                this.baseGroup.appendChild(base);
                this.bases.push(base);
            }  
            
            requestAnimationFrame(() => this.tick());
        }
    }

    private draw()
    {
        let topPath = [];
        let bottomPath = [];
        

        for (let i = 0; i < this.points; i++) 
        {
            let x = String((i + 1) * this.rarity);
            let y1 = String(Math.sin(this.freq * (i + this.phase)) * this.amplitude + (this._height/2));
            let y2 = String(Math.sin(this.freq * (i + this.phase)) * -this.amplitude + (this._height/2));

            topPath.push([x, y1]);
            bottomPath.push([x, y2]);
        }   

        let gaps = Math.round(this.points / (this.data.length - 1));
        console.log(gaps)
        for (let i = 0; i < this.data.length; i++) 
        {
            let j = i * gaps;
            let x = String((j + 1) * this.rarity);
            let y1 = String(Math.sin(this.freq * (j + this.phase)) * this.amplitude + (this._height/2));
            let y2 = String(Math.sin(this.freq * (j + this.phase)) * -this.amplitude + (this._height/2));

            let base = this.bases[i];
            base.setAttribute('x1', x);
            base.setAttribute('x2', x);
            base.setAttribute('y1', y1);
            base.setAttribute('y2', y2);
        }

        let topPathString = '';
        let bottomPathString = '';

        for (let i = 0; i < topPath.length; i++) 
        {
            topPathString += (i == 0 ? 'M' : 'L');
            topPathString += topPath[i].join(' ');

            bottomPathString += (i == 0 ? 'M' : 'L');
            bottomPathString += bottomPath[i].join(' ');
        }
        this.lineTop.setAttribute("d", topPathString);
        this.lineBottomOver.setAttribute("d", bottomPathString);
        this.lineBottomUnder.setAttribute("d", bottomPathString);

        let lineSize = this.lineBottomOver.getTotalLength()
        let curveSize = (lineSize - (lineSize * this.freq)) / 1.5;
        this.lineBottomOver.style.strokeDasharray = `${curveSize} ${curveSize}`;
        this.lineBottomOver.style.strokeDashoffset = `${(curveSize / 2) + this.rarity * this.phase}`;
        
    }

    tick()
    {
        this.phase += this.rotationSpeed;
        this.draw();
        requestAnimationFrame(() => this.tick());
    }

    onResize()
	{
        
        

        if(this._container)
        {
            this._width = this._container.offsetWidth;
            this._height = this._container.offsetHeight;

            this.svg.setAttribute('width', String(this._width));
            this.svg.setAttribute('height', String(this._height));

            
            this.points = Math.round(this.width / this.curveResolution)
            this.amplitude = (this.height - (this.padding * 2)) / 2;
            this.rarity = this.width / this.points;
            if(this.rarity < this.minBaseGap) this.rarity = this.minBaseGap;
        }
    }
    
    private get width() { return this._width - (this.padding * 2) };
    private get height() { return this._height - (this.padding * 2) };

}