import './app.scss';
import HTML from './app.html';
import { Component } from '../common/component';
import { TweenMax, Power4, Power1, Bounce, Elastic, Power2 } from "gsap";

export interface Data
{
    id: string;
    label?: string;
}

export class App extends Component
{
    private _container:HTMLElement | null = null;
    private svg:SVGElement;
    private baseGroup:SVGElement;
    private labelGroup:SVGElement;
    private _width:number = 0;
    private _height:number = 0;
    private lineTop:SVGPathElement;
    private lineBottomOver:SVGPathElement;
    private lineBottomUnder:SVGPathElement;

    private amplitude = 0; // wave amplitude
    private rarity = 0; // point spacing
    private targetFreq = 0.15; // angular frequency
    private freq = 0;
    private phase = 0; 
    private minBaseGap = 0;
    private padding = 10;
    private rotationSpeed = 0;
    private targetRotationSpeed = 0.075;
    private curveResolution = 10;
    private points = 0;
    private maxAmplitude = 40;
    private targetMinY = 10;
    private minY = 10;
    
    private labelRadius = 0;
    private targetLabelRadius = 8;
    private labelStroke = 0;
    private targetLabelStroke = 4;
    private labelSpace = 20;

    private backBoneWidth = 0;
    private targetBackBoneWidth = 8;

    private positions = {
        strand: 0.33,
        labels: 0.66
    }

    Percent = [50, ]

    private showDetails:boolean = true;
    private addBlanks:boolean = true;
    private portrait:boolean = false;

    private data: (Data|null)[] = [
        { id: 'basePair', label: 'P_QWE'},
        { id: 'basePair', label: 'P_XYZ'},
        { id: 'basePair', label: 'P_BB8'},
        { id: 'basePair', label: 'P_ABC'},
        { id: 'basePair', label: 'P_QE2'},
        { id: 'basePair', label: 'P_MIA'},
        { id: 'basePair', label: 'P_QWE'},
        { id: 'basePair', label: 'P_123'},
        { id: 'basePair', label: 'P_987'},
        { id: 'basePair', label: 'P_5M5'}
    ]

    private bases:SVGLineElement[] = [];
    private circles:({element: SVGCircleElement, label:SVGTextElement, line:SVGPathElement, top:boolean} | null)[] = [];

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
        this.lineBottomUnder.setAttribute("class", "line bottom");
        this.svg.appendChild(this.lineBottomUnder);

        this.lineTop = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.lineTop.setAttribute("class", "line top");
        this.svg.appendChild(this.lineTop);

        this.lineBottomOver = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.lineBottomOver.setAttribute("class", "line bottom dashed");
        this.svg.appendChild(this.lineBottomOver);        

        //

        this.labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.appendChild(this.labelGroup);
    }

    private onInit()
    {
        this._container = document.getElementById('root');

        if(this.addBlanks)
        {
            this.data.push(null);
            this.data.unshift(null);
        }
        if(this._container)
        {
            this._container.appendChild(this.svg);
            
            window.addEventListener('resize', () => this.onResize())
            this.onResize();
            let top = true;
            let labelCount = 0;

            for (let i = 0; i < this.data.length; i++) 
            {
                let base = document.createElementNS("http://www.w3.org/2000/svg", 'line');
                let classString:string = (this.data[i] !== null) ?  this.data[i].id : 'blank';
                base.setAttribute('class', `base ${classString}`);
                this.baseGroup.appendChild(base);
                this.bases.push(base);

                let circle = (this.data[i] && this.data[i].label) ? document.createElementNS("http://www.w3.org/2000/svg", 'circle') : null;
                let text = circle ? document.createElementNS("http://www.w3.org/2000/svg", 'text') : null;
                let line = circle ? document.createElementNS("http://www.w3.org/2000/svg", 'path') : null;
                this.circles.push(circle ? {element: circle, label: text, line: line, top: top} : null);
                
                
                if(circle)
                {
                    labelCount++;

                    
                    circle.setAttribute('class', `circle ${classString} ${top ? 'top' : 'bottom'}`);
                    circle.setAttribute('r', String(this.labelRadius));
                    
                    text.setAttribute('alignment-baseline', 'middle');
                    text.setAttribute('class', `label ${classString} ${top ? 'top' : 'bottom'}`);
                    text.style.transitionDelay = 1.4 + (0.05 * labelCount) + 's';
                    text.innerHTML = this.data[i].label;
                    
                    line.setAttribute('class', `label-line ${classString} ${top ? 'top' : 'bottom'}`);

                    this.labelGroup.appendChild(line);
                    this.labelGroup.appendChild(circle);
                    this.labelGroup.appendChild(text);
                    
                    top = !top;

                }
            }  
            
            this._container.addEventListener('click', () => this.toggleState())

            setTimeout(() => {
                this.setDetailsState(this.showDetails);
                requestAnimationFrame(() => this.tick());
            }, 0);
            
        }
    }

    private setDetailsState(state:boolean)
    {
        this.showDetails = state;
        if(this._container)
        {
            if(this.showDetails) this._container.classList.add('details');
            else this._container.classList.remove('details');
        }
        
        this.onStateChange();
    }

    private toggleState()
    {
        this.setDetailsState(!this.showDetails)
    }

    private onStateChange()
    {
        TweenMax.to(this, this.showDetails ? 2.5 : 2, {
            backBoneWidth: this.showDetails ? this.targetBackBoneWidth : 0,
            freq: this.showDetails ? this.targetFreq : 0, 
            rotationSpeed: this.showDetails ? this.targetRotationSpeed : 0, 
            minY: this.showDetails ? 0 : this.targetMinY, 
            phase: this.showDetails ? 0 : `+=${(Math.PI * 4) / this.freq}`, 
            labelRadius: this.showDetails ? this.targetLabelRadius : 0, 
            labelStroke: this.showDetails ? this.targetLabelStroke : 0, 
            ease: this.showDetails ? Power4.easeInOut : Power2.easeOut,
            onComplete: () => {if(!this.showDetails) this.phase = 0;}
        })
    }

    private getPositionPoint(i:number) 
    {
        return (i + 1) * this.rarity;
    }

    private getCurvePoint(i:number, direction:number)
    {
        let amp = direction * this.amplitude;
        let minY = direction * this.minY;
        let center = this.positions.strand * (this.portrait ? this._width : this._height);
        return minY + (Math.sin(this.freq * (i + this.phase)) * amp + center);
    }

    private draw()
    {
        let topPath = [];
        let bottomPath = [];

        for (let i = 0; i < this.points; i++) 
        {
            let point = this.getPositionPoint(i);
            let curve1 = this.getCurvePoint(i, 1);
            let curve2 = this.getCurvePoint(i, -1);

            let x1 = this.portrait ? curve1 : point;
            let x2 = this.portrait ? curve2 : point;
            let y1 = this.portrait ? point : curve1;
            let y2 = this.portrait ? point : curve2;

            topPath.push([x1, y1]);
            bottomPath.push([x2, y2]);
        }   

        let gaps = this.points / (this.data.length - 1); 
        let labelCount = 0;

        for (let i = 0; i < this.data.length; i++) 
        {
            let j = i * gaps;
            let point = this.getPositionPoint(j);
            let curve1 = this.getCurvePoint(j, 1);
            let curve2 = this.getCurvePoint(j, -1);

            let x1 = this.portrait ? curve1 : point;
            let x2 = this.portrait ? curve2 : point;
            let y1 = this.portrait ? point : curve1;
            let y2 = this.portrait ? point : curve2;

            let base = this.bases[i];
            base.setAttribute('x1', String(x1));
            base.setAttribute('x2', String(x2));
            base.setAttribute('y1', String(y1));
            base.setAttribute('y2', String(y2));

            if(this.circles[i])
            {
                labelCount++;

                let circle = this.circles[i].element;
                let top = this.circles[i].top;
                let label = this.circles[i].label;
                let line = this.circles[i].line;

                circle.setAttribute('cx', String(top ? x1 : x2));
                circle.setAttribute('cy', String(top ? y1 : y2));
                circle.setAttribute('r', String(this.labelRadius));

                

                label.style.transitionDelay = (this.showDetails ? 0 : 1.4) + (0.05 * labelCount) + 's';
                label.setAttribute('text-anchor', 'middle');
                
                let staticPos = this.portrait ? this._width * this.positions.labels : this._height * this.positions.labels;
                let x = this.portrait ? staticPos : top ? x1 + this.labelSpace : x2 + this.labelSpace
                let y = !this.portrait ? staticPos : top ? y1 - this.labelSpace : y2 - this.labelSpace

                label.setAttribute('x', String(x));
                label.setAttribute('y', String(y));

                let startX = Number(top ? x1 : x2);
                let startY = Number(top ? y1 : y2);
                let linePositions = [
                    'M',
                    startX,
                    startY,
                    'L',
                    startX + this.labelSpace,
                    this.portrait ? (startY - this.labelSpace) : (startY + this.labelSpace),
                    x - (this.portrait ? this.labelSpace : 0),
                    y - (!this.portrait ? this.labelSpace : 0)
                ]
                line.setAttribute('d', linePositions.join(' '))

                circle.style.strokeWidth = String(this.labelStroke);
            }
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
        
        this.lineTop.style.strokeWidth = String(this.backBoneWidth);
        this.lineBottomOver.style.strokeWidth = String(this.backBoneWidth);
        this.lineBottomUnder.style.strokeWidth = String(this.backBoneWidth);

        let lineSize = this.lineBottomOver.getTotalLength()
        let curveSize = (lineSize - (lineSize * this.freq)) / Math.PI;
        this.lineBottomOver.style.strokeDasharray = `${curveSize} ${curveSize}`;
        this.lineBottomOver.style.strokeDashoffset = `${(curveSize / 2) + this.rarity * this.phase}`;
    }

    tick()
    {
        this.phase += this.rotationSpeed;
        if(this.phase > (Math.PI * 4) / this.freq) this.phase = 0

        this.draw();
        requestAnimationFrame(() => this.tick());
    }

    onResize()
	{
        if(this._container)
        {
            this._width = this._container.offsetWidth;
            this._height = this._container.offsetHeight;

            if(this._height >= this.width) this.portrait = true;
            else this.portrait = false;

            this.svg.setAttribute('width', String(this._width));
            this.svg.setAttribute('height', String(this._height));

            
            this.points = (this.portrait ? this.height : this.width) / this.curveResolution;
            this.amplitude = ((this.portrait ? this.width : this.height) - (this.padding * 2)) / 2;
            this.rarity = (this.portrait ? this.height : this.width) / this.points;

            if(this.amplitude > this.maxAmplitude) this.amplitude = this.maxAmplitude;
            if(this.rarity < this.minBaseGap) this.rarity = this.minBaseGap;
        }
    }
    
    private get width() { return this._width - (this.padding * 2) };
    private get height() { return this._height - (this.padding * 2) };

}