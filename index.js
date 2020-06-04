const express = require('express');
const app = express();
const expressGraphQL = require('express-graphql');
const {GraphQLSchema, 
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLList, 
    GraphQLNonNull, 
    GraphQLInt} = require('graphql');
const _ = require('lodash');

const courses = require('./course.json');
const students = require('./student.json');
const grades = require('./grade.json');

const CourseType = new GraphQLObjectType ({
    name: 'Course',
    description: 'Represent courses',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        description: {type: GraphQLNonNull(GraphQLString)},
    })
})

const StudentType = new GraphQLObjectType ({
    name: 'Student',
    description: 'Represent students',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        lastname: {type: GraphQLNonNull(GraphQLString)},
        courseId: {type: GraphQLNonNull(GraphQLInt)},
        course: {
            type: CourseType,
            resolve: (student) => {
                return courses.find(course => course.id === student.courseId)
            }
        }
    })
});

const GradeType = new GraphQLObjectType ({
    name: 'Grade',
    description: 'Represent grades',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        courseId: {type: GraphQLNonNull(GraphQLInt)},
        studentId: {type: GraphQLNonNull(GraphQLInt)},
        grade: {type: GraphQLNonNull(GraphQLInt)},
        course: {
            type: CourseType,
            resolve: (grade) => {
                return courses.find(course => course.id === grade.courseId)
            }
        },
        student: {
            type: StudentType,
            resolve: (grade) => {
                return students.find(student => student.id === grade.studentId)
            }        
        }
    })
});

const RootMutationType = new GraphQLObjectType ({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addCourse: {
            type: CourseType,
            description: 'Add a Course',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                description: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
                const course = {
                    id: courses.length + 1,
                    name: args.name,
                    description: args.description
                }
                courses.push(course)
                return course
            }
        },
        addStudent: {
            type: StudentType,
            description: 'Add a Student',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                lastname: {type: GraphQLNonNull(GraphQLString)},
                courseId: {type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const student = {
                    id: students.length + 1,
                    name: args.name,
                    lastname: args.lastname,
                    courseId: args.courseId
                }
                students.push(student)
                return student
            }
        },
        addGrade: {
            type: GradeType,
            description: 'Add a Grade',
            args: {
                courseId: {type: GraphQLNonNull(GraphQLInt)},
                studentId: {type: GraphQLNonNull(GraphQLInt)},
                grade: {type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const grade = {
                    id: grades.length + 1,
                    courseId: args.courseId,
                    studentId: args.studentId,
                    grade: args.grade
                }
                grades.push(grade)
                return grade
            }
        },
        deleteCourse: {
            type: new GraphQLList(CourseType),
            description: 'Delete a Course',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                _.remove(courses,(course) => {return course.id == args.id})
                return courses;
            }
        },
        deleteStudent: {
            type: new GraphQLList(StudentType),
            description: 'Delete a Student',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                _.remove(students,(student) => {return student.id == args.id})
                _.remove(grades,(grade) => {return grade.studentId == args.id})
                return students;
            }
        },
        deleteGrade: {
            type: new GraphQLList(GradeType),
            description: 'Delete a Grade',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                _.remove(grades,(grade) => {return grade.id == args.id})
                return grades;
            }
        }
    })
});

const RootQueryType = new GraphQLObjectType ({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        courses: {
            type: new GraphQLList(CourseType),
            description: 'List of All Courses',
            resolve: () => courses
        },
        students: {
            type: new GraphQLList(StudentType),
            description: 'List of All Students',
            resolve: () => students
        },
        grades: {
            type: new GraphQLList(GradeType),
            description: 'List of All Grades',
            resolve: () => grades
        },
        course: {
            type: CourseType,
            description: 'Particular Course',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => courses.find(course => course.id === args.id)
        },
        student: {
            type: StudentType,
            description: 'Particular Student',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => students.find(student => student.id === args.id)
        },
        grade: {
            type: GradeType,
            description: 'Particular Grade',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => grades.find(grade => grade.id === args.id)
        },
    }),
});

const schema = new GraphQLSchema ({
    query: RootQueryType,
    mutation: RootMutationType
});

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))

app.listen(3000, () => {
    console.log('Server running')
})