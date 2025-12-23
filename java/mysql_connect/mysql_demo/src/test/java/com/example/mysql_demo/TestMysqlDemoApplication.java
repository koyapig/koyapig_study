package com.example.mysql_demo;

import org.springframework.boot.SpringApplication;

public class TestMysqlDemoApplication {

	public static void main(String[] args) {
		SpringApplication.from(MysqlDemoApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
