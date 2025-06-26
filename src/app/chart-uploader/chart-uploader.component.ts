import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';
import * as am5plugins_exporting from '@amcharts/amcharts5/plugins/exporting';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

@Component({
  selector: 'app-chart-uploader',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chart-uploader.component.html',
  styleUrls: ['./chart-uploader.component.css'],
})
export class ChartUploaderComponent implements OnDestroy {
  private root!: am5.Root;
  private apiUrl = 'http://localhost:3000/data';

  chartType = 'bar'; // default chart type
  jsonInput: string = '';
  processedData: any[] = []; //stores normalized chart data

  constructor(private http: HttpClient) {
    this.fetchChartData();
  }

  //makes the GET req to fetch
  fetchChartData() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.processedData = this.normalizeData(data);
        this.createChart(this.processedData);
      },
      error: () => alert('Failed to load data from backend'),
    });
  }

  onChartTypeChange() {
    this.createChart(this.processedData);
  }

  // submitData() {
  //   try {
  //     const parsed = JSON.parse(this.jsonInput);
  //     const normalized = this.normalizeData(parsed);
  //     this.http.post(this.apiUrl, normalized).subscribe({
  //       next: () => {
  //         alert('Data uploaded successfully!');
  //         this.fetchChartData();
  //       },
  //       error: () => alert('Failed to upload data'),
  //     });
  //   } catch (err) {
  //     alert('Invalid JSON format');
  //   }
  // }

  /**
   * this dynamically detects which fields should be used for category and value and returns an object with the detected field names
   */
  detectFields(data: any[]): { categoryField: string; valueField: string } {
    if (!data || data.length === 0) {
      return { categoryField: 'category', valueField: 'value' };
    }

    const firstItem = data[0];
    const keys = Object.keys(firstItem); // extract all column names

    const categoryFieldCandidates = [
      'category', 'name', 'label', 'country', 'region', 
      'product', 'type', 'group', 'item', 'title'
    ];

    const valueFieldCandidates = [
      'value', 'amount', 'count', 'quantity', 'price', 
      'sales', 'revenue', 'total', 'score', 'rating'
    ];

    let categoryField = categoryFieldCandidates.find(candidate => 
      keys.includes(candidate)
    );

    // if no is match found we use the first string field
    if (!categoryField) {
      categoryField = keys.find(key => 
        typeof firstItem[key] === 'string'
      ) || keys[0];
    }

    // finding value field
    let valueField = valueFieldCandidates.find(candidate => 
      keys.includes(candidate)
    );

    // If no match found, use the first number field
    if (!valueField) {
      valueField = keys.find(key => 
        typeof firstItem[key] === 'number' && key !== categoryField
      );
    }

    // Fallback if still no value field found
    if (!valueField) {
      valueField = keys.find(key => key !== categoryField) || 'value';
    }

    return {
      categoryField: categoryField || 'category',
      valueField: valueField || 'value'
    };
  }

//  { category, value, timestamp } 
  normalizeData(data: any[]): any[] {
    if (!data || data.length === 0) return [];

    const { categoryField, valueField } = this.detectFields(data);

    return data.map((item, i) => {
      return {
        category: item[categoryField] || `Item ${i + 1}`,
        value: Number(item[valueField]) || 0,
        timestamp: item.timestamp || Date.now() + i * 60000,
      };
    });
  }

  createChart(data: any[]) {
    if (this.root) this.root.dispose();
    this.root = am5.Root.new('chartdiv');
    this.root.setThemes([am5themes_Animated.new(this.root)]);

    // Add export menu
    am5plugins_exporting.Exporting.new(this.root, {
      menu: am5plugins_exporting.ExportingMenu.new(this.root, {}),
    });

    switch (this.chartType) {
      case 'bar':
        this.drawBarChart(data);
        break;
      case 'line':
        this.drawLineChart(data);
        break;
      case 'pie':
        this.drawPieChart(data);
        break;
      default:
        console.warn('Unsupported chart type');
    }
  }

  drawBarChart(data: any[]) {
    const chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: true,
        panY: true,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
      })
    );

    chart.set(
      'scrollbarX',
      am5.Scrollbar.new(this.root, { orientation: 'horizontal' })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(this.root, {
        categoryField: 'category',
        renderer: am5xy.AxisRendererX.new(this.root, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
        min: 0,
      })
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(this.root, {
        name: 'Bar Series',
        xAxis,
        yAxis,
        valueYField: 'value',
        categoryXField: 'category',
      })
    );

    series.set(
      'tooltip',
      am5.Tooltip.new(this.root, {
        labelText: 'Category: {categoryX}\nValue: {valueY}',
      })
    );

    series.columns.template.setAll({
      tooltipText: 'Category: {categoryX}\nValue: {valueY}',
      cursorOverStyle: 'pointer',
    });

    let legend = chart.children.push(am5.Legend.new(this.root, {}));
    legend.data.setAll(chart.series.values);

    xAxis.data.setAll(data);
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);
  }

  drawLineChart(data: any[]) {
    const chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: true,
        panY: true,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
      })
    );

    chart.set(
      'scrollbarX',
      am5.Scrollbar.new(this.root, { orientation: 'horizontal' })
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        baseInterval: { timeUnit: 'minute', count: 1 }, //time granularity
        renderer: am5xy.AxisRendererX.new(this.root, {
          minGridDistance: 50,
        }),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {}),
      })
    );

    const series = chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: 'Line Series',
        xAxis,
        yAxis,
        valueYField: 'value',
        valueXField: 'timestamp',
      })
    );

    series.set(
      'tooltip',
      am5.Tooltip.new(this.root, {
        labelText: '{categoryX}: {valueY}',
        pointerOrientation: 'vertical',
      })
    );

    const bullet = series.bullets.push(() => {
      const bulletCircle = am5.Circle.new(this.root, {
        radius: 5,
        fill: series.get('fill'),
        stroke: am5.color('#ffffff'),
        strokeWidth: 2,
      });
      return am5.Bullet.new(this.root, {
        sprite: bulletCircle,
      });
    });

    series.strokes.template.setAll({
      strokeWidth: 3,
    });

    chart.set(
      'cursor',
      am5xy.XYCursor.new(this.root, {
        behavior: 'zoomX',
      })
    );

    let legend = chart.children.push(am5.Legend.new(this.root, {}));
    legend.data.setAll(chart.series.values);

    const processedData = data.map((item) => ({
      ...item,
      categoryX: item.category,
    }));

    series.fills.template.setAll({
      fillOpacity: 0.5,
      visible: true,
    });

    xAxis.data.setAll(processedData);
    series.data.setAll(processedData);
    series.appear(1000);
    chart.appear(1000, 100);
  }

  drawPieChart(data: any[]) {
    const chart = this.root.container.children.push(
      am5percent.PieChart.new(this.root, {
        endAngle: 270, //??
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(this.root, {
        valueField: 'value',
        categoryField: 'category',
        endAngle: 270,
      })
    );

    series.states.create('hidden', {
      endAngle: -90,
    });

    let legend = chart.children.push(am5.Legend.new(this.root, {}));
    legend.data.setAll(data);

    series.data.setAll(data);
    series.appear(1000, 100);
  }

  ngOnDestroy() {
    if (this.root) {
      this.root.dispose();
    }
  }
}