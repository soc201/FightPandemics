resource "aws_sns_topic" "sns_topic" {
  name = "${var.sns_topic_name}"
}

# ---------------------------------------------------------------------------------------------------------------------
# SQS QUEUE
# ---------------------------------------------------------------------------------------------------------------------

resource "aws_sqs_queue" "queue" {
  name = "email-notificaitons"
  redrive_policy  = "{\"deadLetterTargetArn\":\"${aws_sqs_queue.queue_dl.arn}\",\"maxReceiveCount\":5}"
  visibility_timeout_seconds = 300

  tags = {
    Environment = "dev"
  }
}


resource "aws_sqs_queue" "queue_dl" {
  name = "queue_dl"
}

# ---------------------------------------------------------------------------------------------------------------------
# SQS POLICY
# ---------------------------------------------------------------------------------------------------------------------

resource "aws_sqs_queue_policy" "notifications_queue_policy" {
  queue_url = "${aws_sqs_queue.queue.id}"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "sqspolicy",
  "Statement": [
    {
      "Sid": "First",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "sqs:SendMessage",
      "Resource": "${aws_sqs_queue.queue.arn}",
      "Condition": {
        "ArnEquals": {
          "aws:SourceArn": "${aws_sns_topic.sns_topic.arn}"
        }
      }
    }
  ]
}
POLICY
}

# ---------------------------------------------------------------------------------------------------------------------
# SNS SUBSCRIPTION
# ---------------------------------------------------------------------------------------------------------------------

resource "aws_sns_topic_subscription" "sqs_target" {
  topic_arn = "${aws_sns_topic.sns_topic.arn}"
  protocol  = "sqs"
  endpoint  = "${aws_sqs_queue.queue.arn}"
}
