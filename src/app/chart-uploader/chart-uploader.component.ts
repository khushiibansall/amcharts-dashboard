import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

@Component({
  selector: 'app-chart-uploader',
  standalone: true,
  templateUrl: './chart-uploader.component.html',
  styleUrls: ['./chart-uploader.component.css'],
})
export class ChartUploaderComponent implements AfterViewInit, OnDestroy {
  private root!: am5.Root;

  ngAfterViewInit() {
    this.createChart(this.defaultData);
  }

  defaultData = [
    { country: 'USA', value: 2025 },
    { country: 'China', value: 1882 },
    { country: 'Japan', value: 1809 },
    { country: 'Germany', value: 1322 },
    { country: 'UK', value: 1122 },
    { country: 'France', value: 1114 },
    { country: 'India', value: 984 },
    { country: 'Spain', value: 711 },
    { country: 'Netherlands', value: 665 },
    { country: 'South Korea', value: 443 },
    { country: 'Canada', value: 441 },
  ];

  handleFileInput(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result as string;

      let data: any[] = [];

      if (file.name.endsWith('.json')) {
        try {
          data = JSON.parse(content);
        } catch {
          alert('Invalid JSON file.');
          return;
        }
      } else if (file.name.endsWith('.csv')) {
        const lines = content.trim().split('\n');
        const [header, ...rows] = lines;

        const [countryKey, valueKey] = header.split(',');

        data = rows.map((line) => {
          const [country, value] = line.split(',');
          return { [countryKey.trim()]: country.trim(), [valueKey.trim()]: +value.trim() };
        });
      }

      this.createChart(data);
    };

    reader.readAsText(file);
  }

  createChart(data: any[]) {
    if (this.root) {
      this.root.dispose();
    }

    let root = am5.Root.new('chartdiv');
    this.root = root;

    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 1,
      })
    );

    let cursor = chart.set('cursor', am5xy.XYCursor.new(root, {}));
    cursor.lineY.set('visible', false);

    let xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 30,
      minorGridEnabled: true,
    });

    xRenderer.labels.template.setAll({
      rotation: -90,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15,
    });

    xRenderer.grid.template.setAll({ location: 1 });

    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0.3,
        categoryField: 'country',
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    let yRenderer = am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 });

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0.3,
        renderer: yRenderer,
      })
    );

    let series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Series 1',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'value',
        sequencedInterpolation: true,
        categoryXField: 'country',
        tooltip: am5.Tooltip.new(root, {
          labelText: '{valueY}',
        }),
      })
    );

    series.columns.template.setAll({
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
      strokeOpacity: 0,
    });

    series.columns.template.adapters.add('fill', (fill, target) =>
      chart.get('colors')!.getIndex(series.columns.indexOf(target))
    );

    series.columns.template.adapters.add('stroke', (stroke, target) =>
      chart.get('colors')!.getIndex(series.columns.indexOf(target))
    );

    xAxis.data.setAll(data);
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);
  }

  ngOnDestroy() {
    if (this.root) {
      this.root.dispose();
    }
  }
}
