const Expense = require('../models/expense');
const sequelize = require('../util/database');

exports.postAddExpense = async (req, res, next) => {
  let transaction;
  try {
    const { amount, description, category } = req.body;
    transaction = await sequelize.transaction();

    const expense = await Expense.create({
      amount,
      description,
      category,
      userId: req.user.id
    }, { transaction });

    await req.user.update({ totalExpense: req.user.totalExpense + amount }, { transaction });

    await transaction.commit();

    res.status(200).json({
      status: true,
      data: expense,
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};

exports.postEditExpense = async (req, res, next) => {
  let transaction;
  try {
    const { id, amount, description, category } = req.body;

    transaction = await sequelize.transaction();

    const existingExpense = await Expense.findOne({ where: { id:id, userId: req.user.id } });

    await req.user.update({ totalExpense: req.user.totalExpense - existingExpense.amount + amount }, { transaction });

    const updatedCount = await existingExpense.update({ amount, description, category }, { transaction });

    await transaction.commit();

    if (updatedCount === 0) {
      throw new Error('Expense not found or you do not have permission to edit');
    }

    res.status(200).json({
      status: true,
      data: { id },
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.log(err);
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};

exports.postDeleteExpense = async (req, res, next) => {
  let transaction;
  try {
    const id = req.params.expenseid;

    transaction = await sequelize.transaction();

    const expense = await Expense.findOne({ where: { id, userId: req.user.id } });

    await req.user.update({ totalExpense: req.user.totalExpense - expense.amount}, { transaction });

    if (!expense) {
      throw new Error('Expense not found or you do not have permission to delete');
    }

    await expense.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      status: true,
      data: { id },
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.log(err);
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const pageNo = req.query.page || 1;
    const ITEM_PER_PAGE = parseInt(req.query.rowPerPage || 5);
    // console.log(ITEM_PER_PAGE);
    const expenses = await req.user.getExpenses({
      offset: (pageNo-1) * ITEM_PER_PAGE,
      limit:ITEM_PER_PAGE,
      order:[['id','DESC']]
    });
    const totalExpenseCount = await  Expense.count({where:{userId:req.user.id}})
      // Calculate total page count
      const lastPage   = Math.ceil(totalExpenseCount / ITEM_PER_PAGE);
      const hasNextPage = pageNo * ITEM_PER_PAGE < totalExpenseCount;
      const nextPage = pageNo+1;
      const hasPrevPage = pageNo > 1;     
      const PrevPage= pageNo-1;
      

    

    res.status(200).json({
      status: true,
       expenses,lastPage,hasNextPage,nextPage,hasPrevPage,PrevPage,pageNo
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      error: err.message, 
    });
  }
};

exports.getEditExpense = async (req, res, next) => {
  try {
    const expenseid = req.params.expenseid;
    const expense = await Expense.findByPk(expenseid);
    if (!expense) {
      throw new Error('Expense not found');
    }
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};
