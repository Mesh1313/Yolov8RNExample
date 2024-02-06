//
//  ObjectDetectionPlugin.swift
//  yolotestapp
//
//  Created by Yevhen Ovsiannikov on 2024-01-31.
//

import Foundation
import Vision

@objc(ObjectDetectionFrameProcessorPlugin)
public class ObjectDetectionFrameProcessorPlugin: NSObject, FrameProcessorPluginBase {
  static private var modelHandler = ModelHandler()

  @objc
  public static func callback(_ frame: Frame!, withArgs args: [Any]!) -> Any! {
    guard let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else { return [] as [Any] }
    let orientation = frame.orientation
    let modelHandler = ObjectDetectionFrameProcessorPlugin.modelHandler
    
    guard let predictions = modelHandler.detect(imageBuffer: imageBuffer, orientation: orientation) else { return [] as [Any] }
    
    return modelHandler.preparePredictions(predictions: predictions)
  }
}
