
import { Bodies, Body, Composite, Composites, Engine, Events, Mouse, MouseConstraint, Render, Runner } from "matter-js";
import { Func } from "../core/func";
import { MyDisplay } from "../core/myDisplay";
import { Tween } from "../core/tween";
import { Util } from "../libs/util";
import { Color } from 'three/src/math/Color';

// -----------------------------------------
//
// -----------------------------------------
export class Contents extends MyDisplay {

  public engine:Engine;
  public render:Render;

  // 外枠
  private _frame:Array<Body> = [];

  private _stackA:Composite;
  private _stackB:Composite;
  private _stackSizeA:number = 30;
  private _stackSizeB:number = 200;

  // 表示用UIパーツ
  private _itemA:Array<HTMLInputElement> = []; // 正方形
  private _itemB:Array<HTMLInputElement> = []; // 長いやつ

  constructor(opt:any) {
    super(opt)

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    // エンジン
    this.engine = Engine.create();

    // レンダラー
    this.render = Render.create({
      element: document.body,
      engine: this.engine,
      options: {
        width: sw,
        height: sh,
        showAngleIndicator: false,
      }
    });

    // 外枠
    this._frame.push(Bodies.rectangle(0, -50, 9999, 100, {isStatic:true}));
    this._frame.push(Bodies.rectangle(sw + 50, 0, 100, 9999, {isStatic:true}));
    this._frame.push(Bodies.rectangle(sw, sh + 50, 9999, 100, {isStatic:true}));
    this._frame.push(Bodies.rectangle(-50, 0, 100, 9999, {isStatic:true}));
    Composite.add(this.engine.world, [
      this._frame[0],
      this._frame[1],
      this._frame[2],
      this._frame[3],
    ])

    // 正方形の
    this._stackA = Composites.stack(200, 0, 10, 5, 10, 10, (x:number, y:number) => {
      return Bodies.rectangle(x, y, this._stackSizeA, this._stackSizeA, {restitution:0.6, friction:0.1})
    })
    Composite.add(this.engine.world, [
      this._stackA
    ])

    // 長いやつ
    this._stackB = Composites.stack(sw * 0.5, 0, 4, 4, 10, 10, (x:number, y:number) => {
      return Bodies.rectangle(x, y, this._stackSizeB, this._stackSizeA, {restitution:0.6, friction:0.1})
    })
    Composite.add(this.engine.world, [
      this._stackB
    ])

    // マウス
    const mouse = Mouse.create(this.render.canvas)
    const mouseConstraint = MouseConstraint.create(this.engine, {
      mouse:mouse,
    });
    Composite.add(this.engine.world, mouseConstraint);
    this.render.mouse = mouse;

    // run the renderer
    Render.run(this.render);

    // create runner
    const runner:Runner = Runner.create();

    // run the engine
    Runner.run(runner, this.engine);

    // 描画後イベント
    Events.on(this.render, 'afterRender', () => {
      this._eAfterRender();
    })

    // 正方形のパーツ
    let num = this._stackA.bodies.length;
    for(let i = 0; i < num; i++) {
      const item = document.createElement('input');
      const type = Util.instance.randomArr(['checkbox', 'radio', 'checkbox', 'radio', 'color'])
      item.setAttribute('type', type);
      this.getEl().append(item);

      item.checked = Util.instance.hit(2)

      if(type == 'color') {
        const col = new Color(Util.instance.random(0,1), Util.instance.random(0,1), Util.instance.random(0,1))
        item.value = '#' + col.getHexString();
      }

      Tween.instance.set(item, {
        width: this._stackSizeA,
        height: this._stackSizeA
      })

      this._itemA.push(item);
    }

    // 長いパーツ
    num = this._stackB.bodies.length;
    for(let i = 0; i < num; i++) {
      const item = document.createElement('input');
      const type = Util.instance.randomArr(['text', 'password', 'range'])
      item.setAttribute('type', type);
      this.getEl().append(item);

      if(type == 'range') {
        item.value = String(Util.instance.randomInt(0, 100));
      }

      if(type == 'text' || type == 'password') {
        for(let l = 0; l < 50; l++) {
          item.value += Util.instance.randomArr('ABCDEFGHIKLMNOPRSTUVWXYZ0123456789'.split(''));
        }
      }

      Tween.instance.set(item, {
        width: this._stackSizeB,
        height: this._stackSizeA
      })

      this._itemB.push(item);
    }

    this._resize();
  }


  private _eAfterRender(): void {
    // 物理演算結果をパーツに反映
    this._stackA.bodies.forEach((val,i) => {
      const item = this._itemA[i];
      const pos = val.position
      Tween.instance.set(item, {
        x:pos.x - this._stackSizeA * 0.5,
        y:pos.y - this._stackSizeA * 0.5,
        rotationZ:Util.instance.degree(val.angle),
      })
    })

    this._stackB.bodies.forEach((val,i) => {
      const item = this._itemB[i];
      const pos = val.position
      Tween.instance.set(item, {
        x:pos.x - this._stackSizeB * 0.5,
        y:pos.y - this._stackSizeA * 0.5,
        rotationZ:Util.instance.degree(val.angle),
      })
    })
  }


  protected _update(): void {
    super._update();
  }


  protected _resize(): void {
    super._resize();

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    this.render.canvas.width = sw;
    this.render.canvas.height = sh;
  }
}