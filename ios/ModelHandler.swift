//
//  yoloUtils.swift
//  yolotestapp
//
//  Created by Yevhen Ovsiannikov on 2024-01-29.
//

import Foundation
import CoreImage
import UIKit
import Vision
import ImageIO

class ModelHandler {
  lazy var objectDectectionModel = { return try? yolov8n() }()
  
  // MARK: - Vision Properties
  var request: VNCoreMLRequest?
  let sequenceRequestHandler = VNSequenceRequestHandler()
  var visionModel: VNCoreMLModel?
  var isInferencing = false
  var predictions: [VNRecognizedObjectObservation] = []
  var imageBuf: CVImageBuffer?
  
  init() {
    setUpModel()
  }
  
  // MARK: - Setup Core ML
  private func setUpModel() {
    guard let objectDectectionModel = objectDectectionModel else { fatalError("fail to load the model") }
    if let _visionModel = try? VNCoreMLModel(for: objectDectectionModel.model!) {
      visionModel = _visionModel
      request = VNCoreMLRequest(model: _visionModel, completionHandler: visionRequestDidComplete)
      request?.imageCropAndScaleOption = .scaleFill
    } else {
      fatalError("fail to create vision model")
    }
  }
  
  private func visionRequestDidComplete(request: VNRequest, error: Error?) {
    if let _predictions = request.results as? [VNRecognizedObjectObservation] {

      predictions = _predictions

      DispatchQueue.main.async {
        self.isInferencing = false
      }
    } else {
      self.isInferencing = false
    }
  }
  
  func detect(imageBuffer: CVImageBuffer, orientation: UIImage.Orientation) -> [VNRecognizedObjectObservation]? {
    if !self.isInferencing {

      self.isInferencing = true

      imageBuf = imageBuffer
      
      detectObjects(pixelBuffer: imageBuffer)
      
      return predictions
    } else {
      return predictions
    }
  }
  
  private func detectObjects(pixelBuffer: CVPixelBuffer) {
    guard let request = request else { fatalError() }

    let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer)
    try? handler.perform([request])
  }
  
  func preparePredictions(predictions: [VNRecognizedObjectObservation]) -> [Any]? {
    guard let _imgBuf = imageBuf else {
      return nil
    }
    
    var result: [Any] = []
    
    for prediction in predictions {
      var data: [String: Any] = [:]

      let scale = CGAffineTransform.identity.scaledBy(x: CGFloat(CVPixelBufferGetWidth(_imgBuf)), y: CGFloat(CVPixelBufferGetHeight(_imgBuf)))
      let transform = CGAffineTransform(scaleX: 1, y: -1).translatedBy(x: 0, y: -1)
      let bgRect = prediction.boundingBox.applying(transform).applying(scale)

      data["uuid"] = prediction.uuid
      data["label"] = prediction.labels.first?.identifier
      data["confidence"] = prediction.labels.first?.confidence
      data["box"] = ["x": bgRect.origin.x,
                     "y": bgRect.origin.y,
                     "width": bgRect.width,
                     "height": bgRect.height]

      result.append(data)

    }

    return result
  }
}

