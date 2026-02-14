output "ec2_public_ip" {
  value = aws_instance.cafelove_ec2.public_ip
}
