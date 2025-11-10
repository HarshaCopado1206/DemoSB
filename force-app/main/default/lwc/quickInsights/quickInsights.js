import { LightningElement, api } from "lwc";

export default class QuickInsights extends LightningElement {
  @api stringTitle;
  @api stringIconName;
  @api stringFooter;

  @api stringMetricStatus1;
  @api stringMetric1;
  @api stringValue1;
  @api stringValue1Color;
  @api stringMetric1IconName;

  @api stringMetricStatus2;
  @api stringMetric2;
  @api stringValue2;
  @api stringValue2Color;
  @api stringMetric2IconName;

  @api stringMetricStatus3;
  @api stringMetric3;
  @api stringValue3;
  @api stringValue3Color;
  @api stringMetric3IconName;

  @api stringMetricStatus4;
  @api stringMetric4;
  @api stringValue4;
  @api stringValue4Color;
  @api stringMetric4IconName;

  get colorClassValue1() {
    return this.stringValue1Color ? this.stringValue1Color.toLowerCase() + " value" : "black value";
  }

  get colorClassValue2() {
    return this.stringValue2Color ? this.stringValue2Color.toLowerCase() + " value" : "black value";
  }

  get colorClassValue3() {
    return this.stringValue3Color ? this.stringValue3Color.toLowerCase() + " value" : "black value";
  }

  get colorClassValue4() {
    return this.stringValue4Color ? this.stringValue4Color.toLowerCase() + " value" : "black value";
  }

  get colorClassValue4() {
    return this.stringValue4Color ? this.stringValue4Color.toLowerCase() 
 + " value" : "black value";
  }

  get colorClassValue4() {
    return this.stringValue4Color ? this.stringValue4Color.toLowerCase() 
 + " value" : "black value";
  }

  get columnSize() {
      var numberOfMetrics = (this.stringMetricStatus1 ? 1 : 0) + (this.stringMetricStatus2 ? 1 : 0) + (this.stringMetricStatus3 ? 1 : 0) + (this.stringMetricStatus4 ? 1 : 0)
      
      return 12 / (numberOfMetrics === 0 ? 1 : numberOfMetrics);
  }
}